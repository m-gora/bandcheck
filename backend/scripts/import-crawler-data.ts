import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline';
import postgres from 'postgres';
import { normalizeCrawledBand, type ImportedBand } from '../src/ingestion/crawler-data';

const DEFAULT_FILE = resolve(import.meta.dir, '../../crawler/data/bands.ndjson');
const DEFAULT_BATCH_SIZE = 500;

interface Options {
  apply: boolean;
  file: string;
  limit?: number;
  batchSize: number;
}

interface Summary {
  read: number;
  malformed: number;
  invalid: number;
  incomplete: number;
  duplicateMaIds: number;
  eligible: number;
  inserted: number;
  alreadyPresent: number;
  committedBatches: number;
}

function parsePositiveInteger(value: string | undefined, option: string): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${option} must be a positive integer`);
  }
  return parsed;
}

function parseOptions(args: string[]): Options {
  let apply = false;
  let file = process.env.BANDS_FILE ?? DEFAULT_FILE;
  let limit: number | undefined;
  let batchSize = DEFAULT_BATCH_SIZE;

  for (const arg of args) {
    if (arg === '--apply') {
      apply = true;
    } else if (arg === '--dry-run') {
      apply = false;
    } else if (arg.startsWith('--file=')) {
      file = resolve(arg.slice('--file='.length));
    } else if (arg.startsWith('--limit=')) {
      limit = parsePositiveInteger(arg.slice('--limit='.length), '--limit');
    } else if (arg.startsWith('--batch-size=')) {
      batchSize = parsePositiveInteger(arg.slice('--batch-size='.length), '--batch-size')!;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: bun run db:import-crawler [options]

Options:
  --dry-run          Validate and summarize only (default)
  --apply            Insert rows into PostgreSQL
  --file=PATH        NDJSON input (default: crawler/data/bands.ndjson)
  --limit=N          Process at most N unique, eligible bands
  --batch-size=N     Rows per transaction (default: ${DEFAULT_BATCH_SIZE})

DATABASE_URL is required with --apply. Imports are idempotent on maId.
`);
      process.exit(0);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return { apply, file, limit, batchSize };
}

async function insertBatch(
  client: ReturnType<typeof postgres>,
  batch: ImportedBand[],
): Promise<number> {
  const payload = batch.map((band) => ({
    id: band.id,
    ma_id: band.maId,
    name: band.name,
    description: band.description,
    genres: band.genres,
    location: band.location,
    formed: band.formed,
    website: null,
    image_url: band.imageUrl,
    members: band.members,
    source_metadata: band.sourceMetadata,
  }));

  const inserted = await client.begin((transaction) => transaction`
    INSERT INTO bands (
      id,
      ma_id,
      name,
      description,
      genres,
      location,
      formed,
      website,
      image_url,
      members,
      source_metadata
    )
    SELECT
      input.id,
      input.ma_id,
      input.name,
      input.description,
      input.genres,
      input.location,
      input.formed,
      input.website,
      input.image_url,
      input.members,
      input.source_metadata
    FROM jsonb_to_recordset(${transaction.json(JSON.parse(JSON.stringify(payload)))}::jsonb) AS input(
      id text,
      ma_id text,
      name text,
      description text,
      genres jsonb,
      location text,
      formed text,
      website text,
      image_url text,
      members jsonb,
      source_metadata jsonb
    )
    ON CONFLICT (ma_id) WHERE ma_id IS NOT NULL DO NOTHING
    RETURNING ma_id
  `);

  return inserted.length;
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const databaseUrl = process.env.DATABASE_URL;
  if (options.apply && !databaseUrl) {
    throw new Error('DATABASE_URL is required with --apply');
  }

  const summary: Summary = {
    read: 0,
    malformed: 0,
    invalid: 0,
    incomplete: 0,
    duplicateMaIds: 0,
    eligible: 0,
    inserted: 0,
    alreadyPresent: 0,
    committedBatches: 0,
  };
  const seenMaIds = new Set<string>();
  let batch: ImportedBand[] = [];
  const client = options.apply
    ? postgres(databaseUrl!, { max: 1, connect_timeout: 10 })
    : undefined;

  const flush = async () => {
    if (batch.length === 0) return;
    if (client) {
      const inserted = await insertBatch(client, batch);
      summary.inserted += inserted;
      summary.alreadyPresent += batch.length - inserted;
      summary.committedBatches++;
      if (summary.committedBatches % 20 === 0) {
        console.log(
          `Committed ${summary.inserted + summary.alreadyPresent} rows ` +
          `(inserted ${summary.inserted}, already present ${summary.alreadyPresent})`,
        );
      }
    }
    batch = [];
  };

  try {
    const lines = createInterface({
      input: createReadStream(options.file, { encoding: 'utf8' }),
      crlfDelay: Infinity,
    });

    for await (const line of lines) {
      if (!line.trim()) continue;
      summary.read++;

      let record: unknown;
      try {
        record = JSON.parse(line);
      } catch {
        summary.malformed++;
        continue;
      }

      const normalized = normalizeCrawledBand(record);
      if (normalized.kind === 'invalid') {
        summary.invalid++;
        continue;
      }
      if (normalized.kind === 'incomplete') {
        summary.incomplete++;
        continue;
      }
      if (seenMaIds.has(normalized.band.maId)) {
        summary.duplicateMaIds++;
        continue;
      }

      seenMaIds.add(normalized.band.maId);
      summary.eligible++;
      if (options.apply) {
        batch.push(normalized.band);
        if (batch.length >= options.batchSize) await flush();
      }

      if (options.limit !== undefined && summary.eligible >= options.limit) break;
    }

    await flush();
  } finally {
    if (client) await client.end({ timeout: 5 });
  }

  console.log(`Input file       : ${options.file}`);
  console.log(`Mode             : ${options.apply ? 'APPLY' : 'DRY RUN'}`);
  console.log(`Records read     : ${summary.read}`);
  console.log(`Malformed lines  : ${summary.malformed}`);
  console.log(`Invalid records  : ${summary.invalid}`);
  console.log(`Incomplete skips : ${summary.incomplete}`);
  console.log(`Duplicate maIds  : ${summary.duplicateMaIds}`);
  console.log(`Eligible bands   : ${summary.eligible}`);
  if (options.apply) {
    console.log(`Inserted         : ${summary.inserted}`);
    console.log(`Already present  : ${summary.alreadyPresent}`);
  }

  if (summary.malformed > 0 || summary.invalid > 0) {
    process.exitCode = 2;
  }
}

if (import.meta.main) {
  await main().catch((error: unknown) => {
    console.error('Crawler import failed:', error);
    process.exitCode = 1;
  });
}
