/**
 * Import scraped bands from bands.ndjson into the live bandcheck API.
 *
 * Required env vars:
 *   API_BASE_URL        – e.g. https://bandcheck-api.marcodoes.tech
 *   AUTH0_DOMAIN        – e.g. yourtenant.auth0.com
 *   AUTH0_CLIENT_ID     – M2M app client ID
 *   AUTH0_CLIENT_SECRET – M2M app client secret
 *   AUTH0_AUDIENCE      – API audience (same as backend AUTH0_AUDIENCE)
 *
 * Optional env vars:
 *   CONCURRENCY         – max parallel requests (default: 5)
 *   LIMIT               – stop after N bands (useful for testing)
 *   BANDS_FILE          – override path to bands.ndjson
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BandDetails } from './types.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_BASE_URL = process.env.API_BASE_URL?.replace(/\/$/, '');
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
const CONCURRENCY = Number(process.env.CONCURRENCY ?? '5');
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : undefined;
const DATA_DIR = join(import.meta.dir, '..', 'data');
const BANDS_FILE = process.env.BANDS_FILE ?? join(DATA_DIR, 'bands.ndjson');
const IMPORT_PROGRESS_FILE = join(DATA_DIR, 'import-progress.json');
const SAVE_EVERY = 100;

for (const [name, val] of Object.entries({
  API_BASE_URL,
  AUTH0_DOMAIN,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_AUDIENCE,
})) {
  if (!val) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Auth0 token manager (client credentials flow)
// ---------------------------------------------------------------------------

interface TokenState {
  token: string;
  expiresAt: number; // epoch ms
}

let tokenState: TokenState | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  // Refresh if missing or expiring within 60 seconds
  if (!tokenState || tokenState.expiresAt - now < 60_000) {
    tokenState = await fetchNewToken();
  }
  return tokenState.token;
}

async function fetchNewToken(): Promise<TokenState> {
  const res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      audience: AUTH0_AUDIENCE,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Auth0 token request failed (${res.status}): ${body}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  console.log('✅ Auth0 token obtained (expires in', data.expires_in, 's)');
  return {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

// ---------------------------------------------------------------------------
// Progress tracking
// ---------------------------------------------------------------------------

function loadImportProgress(): Set<string> {
  if (!existsSync(IMPORT_PROGRESS_FILE)) return new Set();
  try {
    const raw = JSON.parse(readFileSync(IMPORT_PROGRESS_FILE, 'utf-8'));
    return new Set<string>(Array.isArray(raw.importedIds) ? raw.importedIds : []);
  } catch {
    return new Set();
  }
}

function saveImportProgress(importedIds: Set<string>): void {
  writeFileSync(
    IMPORT_PROGRESS_FILE,
    JSON.stringify({ importedIds: [...importedIds], savedAt: new Date().toISOString() }, null, 2),
  );
}

// ---------------------------------------------------------------------------
// Data transformation: BandDetails → API CreateBandRequest body
// ---------------------------------------------------------------------------

function transformBand(band: BandDetails): Record<string, unknown> {
  // Split genre string on "/" and "," separators, clean up whitespace
  const genres = band.genre
    .split(/[/,]/)
    .map((g) => g.trim())
    .filter((g) => g.length > 0);

  // Combine location + country into a single location string
  const locationParts = [band.location, band.country].filter((p) => !!p?.trim());
  const location = locationParts.join(', ') || undefined;

  // Members: flatten [{name, instrument}] → ["Name (Instrument)"] strings
  const members = [
    ...band.members.map((m) => (m.instrument ? `${m.name} (${m.instrument})` : m.name)),
  ].filter(Boolean);

  return {
    maId: band.maId,
    name: band.name,
    description: band.description || undefined,
    genres: genres.length > 0 ? genres : ['Metal'],
    location,
    formed: band.formedIn || undefined,
    website: band.url || undefined,
    imageUrl: band.logoUrl ?? band.photoUrl ?? undefined,
    members: members.length > 0 ? members : undefined,
  };
}

// ---------------------------------------------------------------------------
// Determine if a bands.ndjson record has full scraped detail (not browse-only)
// ---------------------------------------------------------------------------

function isFullyScraped(band: BandDetails): boolean {
  // Browse-only entries (from Phase 1) lack detail fields like status/formedIn
  return !!(band.status || band.formedIn || band.lyricalThemes || band.members?.length);
}

// ---------------------------------------------------------------------------
// API call with retry
// ---------------------------------------------------------------------------

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 2_000;

type AttemptResult = 'created' | 'skipped' | 'retry' | 'error';

async function attemptPostBand(
  body: Record<string, unknown>,
  attempt: number,
): Promise<AttemptResult> {
  const bandName = body.name as string;
  let token: string;
  try {
    token = await getAccessToken();
  } catch (err) {
    console.error('  ❌ Cannot obtain auth token:', err);
    return 'error';
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/bands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_BASE_MS * Math.pow(2, attempt));
      return 'retry';
    }
    console.error(`  ❌ Network error for "${bandName}":`, err);
    return 'error';
  }

  if (res.status === 201) return 'created';
  if (res.status === 409) return 'skipped';

  if (res.status === 401 && attempt < MAX_RETRIES) {
    tokenState = null; // force token refresh
    await sleep(500);
    return 'retry';
  }

  if (res.status >= 500 && attempt < MAX_RETRIES) {
    await sleep(RETRY_BASE_MS * Math.pow(2, attempt));
    return 'retry';
  }

  const responseText = await res.text().catch(() => '');
  console.error(`  ❌ Unexpected ${res.status} for "${bandName}": ${responseText.slice(0, 200)}`);
  return 'error';
}

async function postBand(body: Record<string, unknown>): Promise<'created' | 'skipped' | 'error'> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const result = await attemptPostBand(body, attempt);
    if (result !== 'retry') return result;
  }
  return 'error';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Concurrency limiter (semaphore)
// ---------------------------------------------------------------------------

class Semaphore {
  private running = 0;
  private readonly queue: Array<() => void> = [];

  constructor(private readonly max: number) {}

  async acquire(): Promise<void> {
    if (this.running < this.max) {
      this.running++;
      return;
    }
    return new Promise((resolve) => this.queue.push(resolve));
  }

  release(): void {
    this.running--;
    const next = this.queue.shift();
    if (next) {
      this.running++;
      next();
    }
  }
}

// ---------------------------------------------------------------------------
// NDJSON streaming reader (line-by-line, no full file load)
// ---------------------------------------------------------------------------

async function* streamNdjson(filePath: string): AsyncGenerator<BandDetails> {
  const file = Bun.file(filePath);
  const stream = file.stream();
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        try {
          yield JSON.parse(trimmed) as BandDetails;
        } catch {
          // skip malformed lines
        }
      }
    }
  }

  // Flush remaining buffer
  if (buffer.trim()) {
    try {
      yield JSON.parse(buffer.trim()) as BandDetails;
    } catch {
      // skip malformed
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  if (!existsSync(BANDS_FILE)) {
    console.error(`bands.ndjson not found at ${BANDS_FILE}`);
    process.exit(1);
  }

  const importedIds = loadImportProgress();
  console.log(`📋 Already imported: ${importedIds.size} bands`);

  const semaphore = new Semaphore(CONCURRENCY);
  const pending: Promise<void>[] = [];

  let read = 0;
  let filtered = 0;
  let skippedProgress = 0;
  let created = 0;
  let skipped = 0;
  let errors = 0;
  let unsavedCount = 0;

  const processOne = async (band: BandDetails): Promise<void> => {
    await semaphore.acquire();
    try {
      const body = transformBand(band);
      const result = await postBand(body);
      importedIds.add(band.maId);
      unsavedCount++;

      if (result === 'created') {
        created++;
      } else if (result === 'skipped') {
        skipped++;
      } else {
        errors++;
      }

      if (unsavedCount >= SAVE_EVERY) {
        saveImportProgress(importedIds);
        unsavedCount = 0;
        console.log(
          `  💾 Progress saved — created: ${created}, skipped: ${skipped}, errors: ${errors}`,
        );
      }
    } finally {
      semaphore.release();
    }
  };

  for await (const band of streamNdjson(BANDS_FILE)) {
    read++;

    if (!isFullyScraped(band)) {
      filtered++;
      continue;
    }

    if (importedIds.has(band.maId)) {
      skippedProgress++;
      continue;
    }

    if (LIMIT !== undefined && created + skipped >= LIMIT) break;

    pending.push(processOne(band));
  }

  // Wait for all in-flight requests
  await Promise.all(pending);

  // Final save
  saveImportProgress(importedIds);

  console.log('\n==========================');
  console.log('   Import complete');
  console.log('==========================');
  console.log(`  Read from file  : ${read}`);
  console.log(`  Browse-only skip: ${filtered}`);
  console.log(`  Already imported: ${skippedProgress}`);
  console.log(`  Created         : ${created}`);
  console.log(`  Duplicate (409) : ${skipped}`);
  console.log(`  Errors          : ${errors}`);
  console.log('==========================');
}

await main();
