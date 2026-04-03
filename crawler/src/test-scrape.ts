/**
 * Quick test: scrape a single band page to verify selectors.
 * Usage: bun src/test-scrape.ts [--brave]
 */
import { chromium } from 'playwright';
import { getLaunchOptions } from './browser.js';
import { log } from './utils.js';
import type { BrowseEntry, BandDetails } from './types.js';

const MA_BASE = 'https://www.metal-archives.com';
const useBrave = process.argv.includes('--brave');

const testEntry: BrowseEntry = {
  maId: '125',
  name: 'Metallica',
  genre: 'Thrash Metal',
  country: 'United States',
  url: `${MA_BASE}/bands/Metallica/125`,
};

const browser = await chromium.launch(getLaunchOptions(true, useBrave));
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

log('Passing Cloudflare…');
await page.goto(MA_BASE, { waitUntil: 'networkidle', timeout: 60_000 });
await page.waitForTimeout(3000);

log(`Scraping ${testEntry.url}…`);
await page.goto(testEntry.url, { waitUntil: 'networkidle', timeout: 30_000 });
await page.waitForTimeout(2000);

// Run the same extraction logic as scrape.ts
const data = await page.evaluate(() => {
  const result: Record<string, string> = {};
  const nameEl = document.querySelector('h1.band_name a') ?? document.querySelector('h1.band_name');
  result.name = nameEl?.textContent?.trim() ?? '';

  const statsDt = document.querySelectorAll('#band_stats dt');
  const statsDd = document.querySelectorAll('#band_stats dd');
  for (let i = 0; i < statsDt.length; i++) {
    const rawKey = statsDt[i]?.textContent?.trim() ?? '';
    const key = rawKey.replace(/:$/, '').toLowerCase();
    const value = statsDd[i]?.textContent?.trim() ?? '';
    if (key) result[key] = value;
  }

  const logoLink = document.querySelector('a#logo img') as HTMLImageElement | null;
  const logoA = document.querySelector('a#logo') as HTMLAnchorElement | null;
  result.logoUrl = logoLink?.src ?? logoA?.href ?? '';

  const photoLink = document.querySelector('a#photo img') as HTMLImageElement | null;
  const photoA = document.querySelector('a#photo') as HTMLAnchorElement | null;
  result.photoUrl = photoLink?.src ?? photoA?.href ?? '';

  return result;
});

const members = await page.evaluate(() => {
  const parseMembers = (containerId: string) => {
    const container = document.querySelector(`#${containerId}`);
    if (!container) return [];
    const rows = container.querySelectorAll('tr');
    const result: { name: string; instrument: string }[] = [];
    for (const row of rows) {
      const nameEl = row.querySelector('td:first-child a');
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

const band = {
  maId: testEntry.maId,
  name: data.name || testEntry.name,
  genre: data['genre'] ?? testEntry.genre,
  country: data['country of origin'] ?? testEntry.country,
  location: data['location'] ?? '',
  status: data['status'] ?? '',
  formedIn: data['formed in'] ?? '',
  yearsActive: data['years active'] ?? '',
  lyricalThemes: data['themes'] ?? data['lyrical themes'] ?? '',
  currentLabel: data['current label'] ?? data['last label'] ?? '',
  logoUrl: data.logoUrl || null,
  photoUrl: data.photoUrl || null,
  members: members.current,
  pastMembers: members.past,
  liveMembers: members.live,
  url: testEntry.url,
  scrapedAt: new Date().toISOString(),
};

console.log('\n=== SCRAPED BAND ===');
console.log(JSON.stringify(band, null, 2));

await browser.close();
