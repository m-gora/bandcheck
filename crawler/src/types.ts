/** Band entry from the browse/alphabetical listing (Phase 1) */
export interface BrowseEntry {
  /** Metal Archives band ID (numeric string from URL) */
  maId: string;
  /** Band name */
  name: string;
  /** Genre as listed on MA */
  genre: string;
  /** Country */
  country: string;
  /** Full URL to the band page */
  url: string;
}

/** Full band details scraped from the band page (Phase 2) */
export interface BandDetails {
  maId: string;
  name: string;
  genre: string;
  country: string;
  location: string;
  status: string;
  formedIn: string;
  yearsActive: string;
  lyricalThemes: string;
  currentLabel: string;
  description: string;
  logoUrl: string | null;
  photoUrl: string | null;
  /** Current/active members */
  members: MemberEntry[];
  /** Past members */
  pastMembers: MemberEntry[];
  /** Live musicians */
  liveMembers: MemberEntry[];
  url: string;
  scrapedAt: string;
}

export interface MemberEntry {
  name: string;
  instrument: string;
}

/** Progress tracking for resumable crawling */
export interface CrawlProgress {
  /** Letters already fully crawled in browse phase */
  completedLetters: string[];
  /** Total entries discovered so far */
  totalEntries: number;
  /** Band IDs already scraped in detail phase */
  scrapedIds: Set<string> | string[];
  /** Timestamp of last update */
  lastUpdated: string;
}

/** All letter keys used for alphabetical browsing on MA */
export const BROWSE_LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'NBR', // numbers
  '~',   // other characters
] as const;

export type BrowseLetter = typeof BROWSE_LETTERS[number];
