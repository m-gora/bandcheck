export interface CrawledMember {
  name?: unknown;
  instrument?: unknown;
}

export interface CrawledBandRecord extends Record<string, unknown> {
  maId?: unknown;
  name?: unknown;
  genre?: unknown;
  country?: unknown;
  location?: unknown;
  status?: unknown;
  formedIn?: unknown;
  lyricalThemes?: unknown;
  members?: unknown;
  logoUrl?: unknown;
  photoUrl?: unknown;
  description?: unknown;
}

export interface ImportedBand {
  id: string;
  maId: string;
  name: string;
  description: string;
  genres: string[];
  location: string | null;
  formed: string | null;
  imageUrl: string | null;
  members: string[];
  sourceMetadata: Record<string, unknown>;
}

export type NormalizationResult =
  | { kind: 'ready'; band: ImportedBand }
  | { kind: 'incomplete' }
  | { kind: 'invalid'; reason: string };

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Map fields currently used by Bandcheck while retaining the full scrape
 * separately for fields the public Band model does not represent yet.
 */
export function normalizeCrawledBand(value: unknown): NormalizationResult {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { kind: 'invalid', reason: 'record is not an object' };
  }

  const record = value as CrawledBandRecord;
  const maId = stringValue(record.maId);
  const name = stringValue(record.name);

  if (!maId) return { kind: 'invalid', reason: 'missing maId' };
  if (!name) return { kind: 'invalid', reason: 'missing name' };

  const rawMembers = Array.isArray(record.members) ? record.members as CrawledMember[] : [];
  const complete = Boolean(
    stringValue(record.status) ||
    stringValue(record.formedIn) ||
    stringValue(record.lyricalThemes) ||
    rawMembers.length,
  );
  if (!complete) return { kind: 'incomplete' };

  const genres = stringValue(record.genre)
    .split(/[/,]/)
    .map((genre) => genre.trim())
    .filter(Boolean);
  const location = [stringValue(record.location), stringValue(record.country)]
    .filter(Boolean)
    .join(', ');
  const members = rawMembers
    .map((member) => {
      const memberName = stringValue(member?.name);
      const instrument = stringValue(member?.instrument);
      if (!memberName) return '';
      return instrument ? `${memberName} (${instrument})` : memberName;
    })
    .filter(Boolean);

  return {
    kind: 'ready',
    band: {
      id: `ma-${maId}`,
      maId,
      name,
      description: stringValue(record.description),
      genres: genres.length > 0 ? genres : ['Metal'],
      location: location || null,
      formed: stringValue(record.formedIn) || null,
      // `url` in BandDetails is the Metal Archives source page, not an
      // official band website.
      imageUrl: stringValue(record.logoUrl) || stringValue(record.photoUrl) || null,
      members,
      sourceMetadata: record,
    },
  };
}
