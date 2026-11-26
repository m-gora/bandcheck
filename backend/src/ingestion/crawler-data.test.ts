import { describe, expect, it } from 'bun:test';
import { normalizeCrawledBand } from './crawler-data';

describe('normalizeCrawledBand', () => {
  it('maps app fields and retains the full source record', () => {
    const source = {
      maId: '12345',
      name: ' Test Band ',
      genre: 'Heavy Metal / Doom, Sludge',
      country: 'United States',
      location: 'Portland',
      status: 'Active',
      formedIn: '1998',
      lyricalThemes: 'History',
      members: [{ name: 'Member A', instrument: 'Guitar' }],
      url: 'https://www.metal-archives.com/bands/Test_Band/12345',
      scrapedAt: '2026-01-01T00:00:00.000Z',
    };

    const result = normalizeCrawledBand(source);

    expect(result.kind).toBe('ready');
    if (result.kind !== 'ready') return;

    expect(result.band.id).toBe('ma-12345');
    expect(result.band.genres).toEqual(['Heavy Metal', 'Doom', 'Sludge']);
    expect(result.band.location).toBe('Portland, United States');
    expect(result.band.formed).toBe('1998');
    expect(result.band.imageUrl).toBeNull();
    expect(result.band.members).toEqual(['Member A (Guitar)']);
    expect(result.band.sourceMetadata).toEqual(source);
  });

  it('marks browse-only records as incomplete', () => {
    expect(normalizeCrawledBand({
      maId: '12345',
      name: 'Browse Only Band',
      genre: 'Metal',
    })).toEqual({ kind: 'incomplete' });
  });

  it('rejects records without a Metal Archives ID or name', () => {
    expect(normalizeCrawledBand({ name: 'No ID', status: 'Active' })).toEqual({
      kind: 'invalid',
      reason: 'missing maId',
    });
    expect(normalizeCrawledBand({ maId: '12345', status: 'Active' })).toEqual({
      kind: 'invalid',
      reason: 'missing name',
    });
  });
});
