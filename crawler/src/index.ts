import { browseAll } from './browse.js';
import { scrapeAll } from './scrape.js';
import { log, readNdjson, BROWSE_FILE, BANDS_FILE, loadProgress } from './utils.js';
import type { BrowseEntry, BandDetails } from './types.js';

const command = process.argv[2] ?? 'help';

switch (command) {
  case 'browse': {
    // Phase 1: collect all band URLs from the A-Z listing
    const headed = !process.argv.includes('--headless');
    const useBrave = process.argv.includes('--brave');
    await browseAll(headed, useBrave);
    break;
  }

  case 'scrape': {
    // Phase 2: visit each band page and extract details
    const concurrency = Number(process.argv.find((a) => a.startsWith('--concurrency='))?.split('=')[1] ?? 3);
    const headed = !process.argv.includes('--headless');
    const useBrave = process.argv.includes('--brave');
    await scrapeAll(concurrency, headed, useBrave);
    break;
  }

  case 'crawl': {
    // Run both phases sequentially
    const headed = !process.argv.includes('--headless');
    const useBrave = process.argv.includes('--brave');
    const concurrency = Number(process.argv.find((a) => a.startsWith('--concurrency='))?.split('=')[1] ?? 3);
    log('=== Phase 1: Browse ===');
    await browseAll(headed, useBrave);
    log('\n=== Phase 2: Scrape ===');
    await scrapeAll(concurrency, headed, useBrave);
    break;
  }

  case 'stats': {
    const browseEntries = readNdjson<BrowseEntry>(BROWSE_FILE);
    const bandDetails = readNdjson<BandDetails>(BANDS_FILE);
    const progress = loadProgress();

    console.log('\n📊 Crawl Statistics');
    console.log('─'.repeat(40));
    console.log(`Browse entries:      ${browseEntries.length}`);
    console.log(`Band details:        ${bandDetails.length}`);
    console.log(`Letters completed:   ${progress.completedLetters.length}/28`);
    console.log(`Letters remaining:   ${28 - progress.completedLetters.length}`);
    console.log(`Last updated:        ${progress.lastUpdated}`);

    if (browseEntries.length > 0) {
      const genres = new Map<string, number>();
      for (const e of browseEntries) {
        const g = e.genre || 'Unknown';
        genres.set(g, (genres.get(g) ?? 0) + 1);
      }
      const topGenres = [...genres.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
      console.log(`\nTop 10 genres:`);
      for (const [genre, count] of topGenres) {
        console.log(`  ${count.toString().padStart(6)}  ${genre}`);
      }
    }

    console.log();
    break;
  }

  default:
    console.log(`
bandcheck-crawler — Metal Archives snapshot tool

Usage:
  bun src/index.ts <command> [options]

Commands:
  browse     Phase 1: Collect all band URLs from A-Z listing
  scrape     Phase 2: Scrape full details for each band
  crawl      Run both phases sequentially
  stats      Show crawl progress statistics

Options:
  --brave             Use your installed Brave browser instead of Playwright Chromium
  --headless          Run browser without visible window
  --concurrency=N     Number of parallel pages for scraping (default: 3)

Examples:
  bun src/index.ts browse                    # browse with visible browser
  bun src/index.ts scrape --concurrency=5    # scrape 5 bands in parallel
  bun src/index.ts crawl --headless          # full crawl, headless
  bun src/index.ts stats                     # check progress
`);
}
