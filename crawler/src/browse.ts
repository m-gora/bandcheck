import { chromium, type Page, type BrowserContext } from 'playwright';
import {
  BROWSE_LETTERS,
  type BrowseEntry,
  type BrowseLetter,
} from './types.js';
import {
  log,
  randomDelay,
  ensureDataDir,
  appendNdjson,
  BROWSE_FILE,
  loadProgress,
  saveProgress,
  readNdjson,
} from './utils.js';
import { getLaunchOptions } from './browser.js';

const MA_BASE = 'https://www.metal-archives.com';

/**
 * Parse a DataTables AJAX response row into a BrowseEntry.
 *
 * Actual row format from MA:
 *   [0] = "<a href='https://…/bands/Name/12345'>Name</a>"
 *   [1] = 'Country'
 *   [2] = 'Genre'
 *   [3] = '<span class="split_up">Split-up</span>'  (status)
 */
function parseRow(row: string[]): BrowseEntry | null {
  const linkHtml = row[0];
  // MA uses single quotes around href
  const hrefMatch = linkHtml.match(/href=['"]([^'"]+)['"]/);
  const nameMatch = linkHtml.match(/>([^<]+)<\/a>/);
  if (!hrefMatch || !nameMatch) return null;

  const url = hrefMatch[1];
  const idMatch = url.match(/\/(\d+)$/);
  if (!idMatch) return null;

  return {
    maId: idMatch[1],
    name: nameMatch[1].trim(),
    country: row[1]?.trim() ?? '',
    genre: row[2]?.trim() ?? '',
    url,
  };
}

/**
 * Crawl one letter page, handling DataTables server-side pagination.
 *
 * Strategy:
 * 1. Navigate to the browse page for the letter.
 * 2. Intercept the AJAX requests that DataTables makes.
 * 3. Paginate until all entries for that letter are collected.
 */
async function crawlLetter(
  page: Page,
  letter: BrowseLetter,
): Promise<BrowseEntry[]> {
  const entries: BrowseEntry[] = [];
  const pageSize = 500;
  let start = 0;
  let total = Infinity;

  log(`Browsing letter "${letter}"…`);

  // Navigate to the actual listing page (e.g. /lists/A)
  const browseUrl = `${MA_BASE}/lists/${letter}`;

  // Intercept the AJAX request that DataTables fires on page load
  // so we can discover the real endpoint URL
  let discoveredAjaxBase: string | null = null;

  page.on('response', (resp) => {
    const url = resp.url();
    // MA's DataTables AJAX calls contain "ajax" in the path and return JSON
    if (url.includes('/browse/ajax-') || url.includes('/ajax-')) {
      // Strip query params to get the base URL
      discoveredAjaxBase = url.split('?')[0];
    }
  });

  await page.goto(browseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // If we caught the AJAX URL from the initial load, use it.
  // Otherwise fall back to a constructed URL.
  const ajaxBase = discoveredAjaxBase
    ?? `${MA_BASE}/browse/ajax-letter/l/${letter}/json/1`;

  if (discoveredAjaxBase) {
    log(`  Discovered AJAX endpoint: ${discoveredAjaxBase}`);
  } else {
    log(`  Using fallback AJAX endpoint: ${ajaxBase}`);
  }

  // Paginate through the AJAX endpoint
  while (start < total) {
    const params = new URLSearchParams({
      sEcho: '1',
      iColumns: '4',
      sColumns: '',
      iDisplayStart: String(start),
      iDisplayLength: String(pageSize),
      mDataProp_0: '0',
      mDataProp_1: '1',
      mDataProp_2: '2',
      mDataProp_3: '3',
    });

    const fullUrl = `${ajaxBase}?${params}`;

    // Fetch from within the browser context so Cloudflare cookies are sent
    const response = await page.evaluate(async (url: string) => {
      const res = await fetch(url, { credentials: 'include' });
      return res.json();
    }, fullUrl);

    if (!response || !response.aaData) {
      log(`  ⚠ No data in response for "${letter}" at offset ${start}`);
      break;
    }

    total = response.iTotalRecords ?? response.iTotalDisplayRecords ?? 0;

    for (const row of response.aaData) {
      const entry = parseRow(row);
      if (entry) {
        entries.push(entry);
        appendNdjson(BROWSE_FILE, entry);
      }
    }

    log(`  "${letter}": ${entries.length}/${total} entries`);
    start += pageSize;

    if (start < total) {
      await randomDelay(800, 1500);
    }
  }

  // Remove the response listener for the next letter
  page.removeAllListeners('response');

  return entries;
}

/**
 * Phase 1: Collect all band URLs from the alphabetical browse.
 *
 * Launches a headed browser (so you can solve CAPTCHAs if needed on first run),
 * iterates through every letter, and writes results as NDJSON.
 * Supports resumption — skips letters that were already completed.
 */
export async function browseAll(headed = true, useBrave = false): Promise<void> {
  ensureDataDir();
  const progress = loadProgress();
  const completedSet = new Set(progress.completedLetters);

  const remaining = BROWSE_LETTERS.filter((l) => !completedSet.has(l));
  if (remaining.length === 0) {
    log('Browse phase already complete. All letters crawled.');
    const existing = readNdjson<BrowseEntry>(BROWSE_FILE);
    log(`Total entries on disk: ${existing.length}`);
    return;
  }

  log(`Browse phase: ${remaining.length} letters remaining (${remaining.join(', ')})`);

  const browser = await chromium.launch(getLaunchOptions(headed, useBrave));

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  // Initial navigation to pass Cloudflare
  log('Navigating to Metal Archives homepage to pass Cloudflare…');
  await page.goto(MA_BASE, { waitUntil: 'networkidle', timeout: 60_000 });

  // Give the user time to solve a CAPTCHA if Cloudflare presents one
  await page.waitForTimeout(5000);

  // Verify we got through
  const title = await page.title();
  log(`Page title: "${title}"`);

  if (title.toLowerCase().includes('just a moment') || title.toLowerCase().includes('cloudflare')) {
    log('⏳ Cloudflare challenge detected. Waiting up to 60s for manual solve…');
    await page.waitForFunction(
      () => !document.title.toLowerCase().includes('just a moment'),
      { timeout: 60_000 },
    );
    log('✅ Cloudflare challenge passed.');
  }

  let letterCount = 0;
  for (const letter of remaining) {
    try {
      const entries = await crawlLetter(page, letter);
      progress.completedLetters.push(letter);
      progress.totalEntries += entries.length;
      saveProgress(progress);
      log(`✅ Letter "${letter}" done: ${entries.length} bands`);
    } catch (err) {
      log(`❌ Error crawling letter "${letter}": ${err}`);
      // Save progress and continue with next letter
      saveProgress(progress);
    }

    letterCount++;
    // Longer pause between letters
    if (letterCount < remaining.length) {
      await randomDelay(2000, 4000);
    }
  }

  await browser.close();

  const allEntries = readNdjson<BrowseEntry>(BROWSE_FILE);
  log(`\nBrowse phase complete. Total bands: ${allEntries.length}`);
}
