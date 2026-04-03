import { mkdirSync, existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import type { CrawlProgress, BrowseEntry, BandDetails } from './types.js';

/** Base output directory */
export const DATA_DIR = join(import.meta.dir, '..', 'data');
export const BROWSE_FILE = join(DATA_DIR, 'browse.ndjson');
export const BANDS_FILE = join(DATA_DIR, 'bands.ndjson');
export const PROGRESS_FILE = join(DATA_DIR, 'progress.json');

export function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ---------------------------------------------------------------------------
// NDJSON helpers
// ---------------------------------------------------------------------------

export function appendNdjson<T>(filePath: string, record: T): void {
  appendFileSync(filePath, JSON.stringify(record) + '\n');
}

export function readNdjson<T>(filePath: string): T[] {
  if (!existsSync(filePath)) return [];
  const content = readFileSync(filePath, 'utf-8').trim();
  if (!content) return [];
  return content.split('\n').map((line) => JSON.parse(line) as T);
}

// ---------------------------------------------------------------------------
// Progress tracking (resumable)
// ---------------------------------------------------------------------------

export function loadProgress(): CrawlProgress {
  if (!existsSync(PROGRESS_FILE)) {
    return {
      completedLetters: [],
      totalEntries: 0,
      scrapedIds: [],
      lastUpdated: new Date().toISOString(),
    };
  }
  const raw = JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
  return { ...raw, scrapedIds: raw.scrapedIds ?? [] };
}

export function saveProgress(progress: CrawlProgress): void {
  const serializable = {
    ...progress,
    scrapedIds: progress.scrapedIds instanceof Set
      ? [...progress.scrapedIds]
      : progress.scrapedIds,
    lastUpdated: new Date().toISOString(),
  };
  writeFileSync(PROGRESS_FILE, JSON.stringify(serializable, null, 2));
}

// ---------------------------------------------------------------------------
// Delay / rate‑limiting helpers
// ---------------------------------------------------------------------------

/** Sleep for ms milliseconds */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Random delay between min and max ms.
 * Be respectful to MA servers.
 */
export function randomDelay(minMs = 1000, maxMs = 3000): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return sleep(ms);
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

export function log(msg: string): void {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] ${msg}`);
}
