import { chromium, type Page } from 'playwright';
import type { BandDetails, BrowseEntry, MemberEntry } from './types.js';
import {
  log,
  randomDelay,
  sleep,
  ensureDataDir,
  appendNdjson,
  readNdjson,
  BROWSE_FILE,
  BANDS_FILE,
  loadProgress,
  saveProgress,
} from './utils.js';
import { getLaunchOptions } from './browser.js';

const MA_BASE = 'https://www.metal-archives.com';
const MAX_RETRIES = 4;
const BASE_BACKOFF_MS = 5_000;

/** Shared state for adaptive throttling across concurrent pages */
let globalDelayMs = 1500;
let consecutiveRateLimits = 0;

/**
 * Detect if a page response indicates rate limiting or Cloudflare block.
 */
async function isRateLimited(page: Page): Promise<boolean> {
  const title = await page.title().catch(() => '');
  if (title.toLowerCase().includes('just a moment') ||
      title.toLowerCase().includes('cloudflare') ||
      title.toLowerCase().includes('429') ||
      title.toLowerCase().includes('too many requests')) {
    return true;
  }
  // Also check for empty / error page body
  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 200) ?? '').catch(() => '');
  if (bodyText.includes('429') || bodyText.includes('Too Many Requests') || bodyText.includes('Rate limit')) {
    return true;
  }
  return false;
}

/**
 * Scrape a single band page with retry + exponential backoff on rate limits.
 * Returns { data, rateLimited } so the caller knows whether to mark it as done.
 */
async function scrapeBandPage(
  page: Page,
  entry: BrowseEntry,
): Promise<{ data: BandDetails | null; rateLimited: boolean }> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await page.goto(entry.url, { waitUntil: 'networkidle', timeout: 30_000 });
      const status = response?.status() ?? 0;

      // Detect rate limiting via HTTP status or page content
      if (status === 429 || status === 503 || await isRateLimited(page)) {
        const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt);
        consecutiveRateLimits++;
        // Increase global delay when we keep hitting limits
        globalDelayMs = Math.min(30_000, 1500 + consecutiveRateLimits * 2000);
        if (attempt < MAX_RETRIES) {
          log(`  ⏳ Rate limited on ${entry.name} (${status}), retry ${attempt + 1}/${MAX_RETRIES} in ${(backoff / 1000).toFixed(0)}s (global delay now ${(globalDelayMs / 1000).toFixed(1)}s)`);
          await sleep(backoff);
          continue;
        }
        log(`  ❌ Rate limited on ${entry.name} after ${MAX_RETRIES} retries — will retry next run`);
        return { data: null, rateLimited: true };
      }

      // Success — reset rate-limit counter & ease off global delay
      if (consecutiveRateLimits > 0) {
        consecutiveRateLimits = Math.max(0, consecutiveRateLimits - 1);
        globalDelayMs = Math.max(1500, globalDelayMs - 500);
      }

      await page.waitForTimeout(800);

    // Extract data from the band info box using page.evaluate
    const data = await page.evaluate(() => {
      const result: Record<string, string> = {};

      // Band name
      const nameEl = document.querySelector('h1.band_name a') ?? document.querySelector('h1.band_name');
      result.name = nameEl?.textContent?.trim() ?? '';

      // Stats — <dt>/<dd> pairs inside #band_stats
      // Keys come with trailing colons, e.g. "Country of origin:", "Themes:"
      const statsDt = document.querySelectorAll('#band_stats dt');
      const statsDd = document.querySelectorAll('#band_stats dd');
      for (let i = 0; i < statsDt.length; i++) {
        const rawKey = statsDt[i]?.textContent?.trim() ?? '';
        const key = rawKey.replace(/:$/, '').toLowerCase();
        const value = statsDd[i]?.textContent?.trim() ?? '';
        if (key) result[key] = value;
      }

      // Logo URL — <a class="image" id="logo"> wrapping an <img>
      const logoLink = document.querySelector('a#logo img') as HTMLImageElement | null;
      const logoA = document.querySelector('a#logo') as HTMLAnchorElement | null;
      result.logoUrl = logoLink?.src ?? logoA?.href ?? '';

      // Photo URL — <a class="image" id="photo"> wrapping an <img>
      const photoLink = document.querySelector('a#photo img') as HTMLImageElement | null;
      const photoA = document.querySelector('a#photo') as HTMLAnchorElement | null;
      result.photoUrl = photoLink?.src ?? photoA?.href ?? '';

      // Band notes / description
      const notesEl = document.querySelector('.band_comment');
      result.description = notesEl?.textContent?.trim() ?? '';

      return result;
    });

    // Extract members from the members tab
    const members = await page.evaluate(() => {
      const parseMembers = (containerId: string): { name: string; instrument: string }[] => {
        const container = document.querySelector(`#${containerId}`);
        if (!container) return [];
        const rows = container.querySelectorAll('tr');
        const result: { name: string; instrument: string }[] = [];
        for (const row of rows) {
          // Only pick rows where the link points to /artists/ (not /bands/)
          const nameEl = row.querySelector('td:first-child a[href*="/artists/"]');
          const instrEl = row.querySelector('td:nth-child(2)');
          if (!nameEl) continue;
          const name = nameEl.textContent?.trim() ?? '';
          const instrument = instrEl?.textContent?.trim() ?? '';
          if (name) result.push({ name, instrument });
        }
        return result;
      };

      return {
        current: parseMembers('band_tab_members_current'),
        past: parseMembers('band_tab_members_past'),
        live: parseMembers('band_tab_members_live'),
      };
    });

    return {
      data: {
        maId: entry.maId,
        name: data.name || entry.name,
        genre: data['genre'] ?? entry.genre,
        country: data['country of origin'] ?? entry.country,
        location: data['location'] ?? '',
        status: data['status'] ?? '',
        formedIn: data['formed in'] ?? '',
        yearsActive: data['years active'] ?? '',
        lyricalThemes: data['themes'] ?? data['lyrical themes'] ?? '',
        currentLabel: data['current label'] ?? data['last label'] ?? '',
        logoUrl: data.logoUrl || null,
        photoUrl: data.photoUrl || null,
        description: data.description ?? '',
        members: members.current,
        pastMembers: members.past,
        liveMembers: members.live,
        url: entry.url,
        scrapedAt: new Date().toISOString(),
      },
      rateLimited: false,
    };
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt);
        log(`  ⚠ Error scraping ${entry.name} (attempt ${attempt + 1}/${MAX_RETRIES}): ${err} — retrying in ${(backoff / 1000).toFixed(0)}s`);
        await sleep(backoff);
        continue;
      }
      log(`  ❌ Failed to scrape ${entry.name} (${entry.maId}) after ${MAX_RETRIES} retries: ${err}`);
      return { data: null, rateLimited: false };
    }
  }
  return { data: null, rateLimited: false };
}

/**
 * Phase 2: Visit each band page and extract full details.
 *
 * Reads the browse NDJSON for the list of bands, skips already-scraped ones,
 * and writes full details as NDJSON.
 *
 * @param concurrency Number of parallel pages to use (default 3)
 * @param headed      Open a visible browser window (for Cloudflare)
 */
export async function scrapeAll(concurrency = 3, headed = true, useBrave = false): Promise<void> {
  ensureDataDir();

  const entries = readNdjson<BrowseEntry>(BROWSE_FILE);
  if (entries.length === 0) {
    log('No browse data found. Run the browse phase first.');
    return;
  }

  const progress = loadProgress();
  const scrapedSet = new Set(
    Array.isArray(progress.scrapedIds) ? progress.scrapedIds : [...progress.scrapedIds],
  );

  const remaining = entries.filter((e) => !scrapedSet.has(e.maId));
  log(`Scrape phase: ${remaining.length} bands remaining (${scrapedSet.size} already done)`);

  if (remaining.length === 0) {
    log('All bands already scraped.');
    return;
  }

  const browser = await chromium.launch(getLaunchOptions(headed, useBrave));

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  // Pass Cloudflare on the first page
  const initPage = await context.newPage();
  log('Navigating to Metal Archives to pass Cloudflare…');
  await initPage.goto(MA_BASE, { waitUntil: 'networkidle', timeout: 60_000 });
  await initPage.waitForTimeout(5000);

  const title = await initPage.title();
  if (title.toLowerCase().includes('just a moment') || title.toLowerCase().includes('cloudflare')) {
    log('⏳ Cloudflare challenge detected. Waiting up to 60s for manual solve…');
    await initPage.waitForFunction(
      () => !document.title.toLowerCase().includes('just a moment'),
      { timeout: 60_000 },
    );
    log('✅ Cloudflare challenge passed.');
  }
  await initPage.close();

  // Create worker pages
  const pages: Page[] = [];
  for (let i = 0; i < concurrency; i++) {
    pages.push(await context.newPage());
  }

  let processed = 0;
  const total = remaining.length;
  const batchSize = concurrency;

  for (let i = 0; i < total; i += batchSize) {
    const batch = remaining.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map((entry, idx) => scrapeBandPage(pages[idx % pages.length], entry)),
    );

    let batchRateLimited = false;
    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const entry = batch[j];

      if (result.status === 'fulfilled') {
        const { data, rateLimited } = result.value;
        if (data) {
          appendNdjson(BANDS_FILE, data);
        }
        if (rateLimited) {
          // Don't mark rate-limited entries as done — retry next run
          batchRateLimited = true;
        } else {
          // Mark as scraped (success or permanent failure)
          scrapedSet.add(entry.maId);
        }
      } else {
        // Promise rejected — don't mark as done so it retries
        log(`  ⚠ Unexpected error for ${entry.name}: ${result.reason}`);
      }
      processed++;
    }

    // Save progress every batch
    progress.scrapedIds = [...scrapedSet];
    saveProgress(progress);

    if (processed % 100 === 0 || processed === total) {
      log(`Progress: ${processed}/${total} bands scraped (delay: ${(globalDelayMs / 1000).toFixed(1)}s)`);
    }

    // Adaptive delay between batches
    if (i + batchSize < total) {
      if (batchRateLimited) {
        // Extra pause after a rate-limited batch
        log(`  🐌 Backing off for ${(globalDelayMs * 2 / 1000).toFixed(0)}s after rate limit…`);
        await sleep(globalDelayMs * 2);
      } else {
        await randomDelay(globalDelayMs, globalDelayMs + 1500);
      }
    }
  }

  await browser.close();
  log(`\nScrape phase complete. ${processed} bands processed.`);
}
