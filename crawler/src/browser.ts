import { existsSync } from 'node:fs';
import type { LaunchOptions } from 'playwright';
import { log } from './utils.js';

/** Known Brave paths per platform */
const BRAVE_PATHS: Record<string, string[]> = {
  darwin: [
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  ],
  linux: [
    '/usr/bin/brave-browser',
    '/usr/bin/brave',
    '/snap/bin/brave',
  ],
  win32: [
    'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  ],
};

function findBrave(): string | null {
  const candidates = BRAVE_PATHS[process.platform] ?? [];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

/**
 * Build Playwright launch options, optionally using Brave instead of
 * the bundled Chromium.
 *
 * Using Brave has a practical benefit: its fingerprint differs from
 * stock Playwright Chromium, which Cloudflare may flag more aggressively.
 */
export function getLaunchOptions(headed: boolean, useBrave: boolean): LaunchOptions {
  const opts: LaunchOptions = {
    headless: !headed,
    args: ['--disable-blink-features=AutomationControlled'],
  };

  if (useBrave) {
    const bravePath = findBrave();
    if (!bravePath) {
      log('⚠ Brave not found at known paths, falling back to Playwright Chromium');
    } else {
      log(`Using Brave: ${bravePath}`);
      opts.executablePath = bravePath;
    }
  }

  return opts;
}
