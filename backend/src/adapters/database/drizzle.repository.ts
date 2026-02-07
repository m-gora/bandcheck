import { eq, and, like, or, desc } from 'drizzle-orm';
import { db, bands, reviews } from '../../db';
import type { Band, Review, GetBandsQuery, GetBandsResult } from '../../core/domain/entities';
import type { BandRepository, ReviewRepository } from '../../core/ports/repositories';

export class DrizzleBandRepository implements BandRepository {
  async findAll(query: GetBandsQuery): Promise<GetBandsResult> {
    const { search, genre, limit = 50, offset = 0 } = query;
    
    // Apply filters
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(bands.name, `%${search}%`),
          like(bands.description, `%${search}%`)
        )
      );
    }
    if (genre) {
      conditions.push(like(bands.genres, `%${genre}%`));
    }
    
    let allBands;
    if (conditions.length > 0) {
      allBands = await db.select().from(bands).where(and(...conditions)).all();
    } else {
      allBands = await db.select().from(bands).all();
    }
    
    // Parse JSON fields and sort
    const parsedBands = allBands.map(band => this.toDomain(band));
    parsedBands.sort((a, b) => a.name.localeCompare(b.name));
    
    const paginatedBands = parsedBands.slice(offset, offset + limit);
    
    return {
      bands: paginatedBands,
      total: parsedBands.length,
    };
  }

  async findById(id: string): Promise<Band | null> {
    const band = await db.select().from(bands).where(eq(bands.id, id)).get();
    if (!band) return null;
    return this.toDomain(band);
  }

  async create(band: Band): Promise<Band> {
    await db.insert(bands).values(this.toPersistence(band));
    return band;
  }

  async update(id: string, bandData: Partial<Band>): Promise<Band> {
    const updateData: any = { ...bandData };
    if (updateData.genres) {
      updateData.genres = JSON.stringify(updateData.genres);
    }
    if (updateData.members) {
      updateData.members = JSON.stringify(updateData.members);
    }

    await db.update(bands)
      .set(updateData)
      .where(eq(bands.id, id));

    const updated = await this.findById(id);
    if (!updated) throw new Error('Band not found after update');
    return updated;
  }

  async existsByName(name: string): Promise<boolean> {
    const existing = await db.select()
      .from(bands)
      .where(eq(bands.name, name))
      .get();
    return !!existing;
  }

  async getStatistics(): Promise<{ safe: number; unsafe: number; controversial: number; pending: number; total: number }> {
    const allBands = await db.select().from(bands).all();
    
    const stats = {
      safe: 0,
      unsafe: 0,
      controversial: 0,
      pending: 0,
      total: allBands.length,
    };

    for (const band of allBands) {
      if (band.safetyStatus === 'safe') stats.safe++;
      else if (band.safetyStatus === 'unsafe') stats.unsafe++;
      else if (band.safetyStatus === 'controversial') stats.controversial++;
      else stats.pending++;
    }

    return stats;
  }

  async findLatest(limit: number): Promise<Band[]> {
    const latestBands = await db.select()
      .from(bands)
      .orderBy(desc(bands.createdAt))
      .limit(limit)
      .all();
    
    return latestBands.map(band => this.toDomain(band));
  }

  private toDomain(band: any): Band {
    return {
      ...band,
      genres: typeof band.genres === 'string' ? JSON.parse(band.genres) : band.genres,
      members: typeof band.members === 'string' ? JSON.parse(band.members) : (band.members || []),
    };
  }

  private toPersistence(band: Band): any {
    return {
      ...band,
      genres: JSON.stringify(band.genres),
      members: JSON.stringify(band.members),
    };
  }
}

export class DrizzleReviewRepository implements ReviewRepository {
  async findByBandId(bandId: string): Promise<Review[]> {
    const allReviews = await db.select()
      .from(reviews)
      .where(eq(reviews.bandId, bandId))
      .orderBy(desc(reviews.createdAt))
      .all();
    
    return allReviews.map(review => this.toDomain(review));
  }

  async create(review: Review): Promise<Review> {
    await db.insert(reviews).values(this.toPersistence(review));
    return review;
  }

  async findLatest(limit: number): Promise<Array<Review & { bandName?: string }>> {
    const latestReviews = await db.select({
      review: reviews,
      bandName: bands.name,
    })
      .from(reviews)
      .leftJoin(bands, eq(reviews.bandId, bands.id))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .all();
    
    return latestReviews.map(({ review, bandName }) => ({
      ...this.toDomain(review),
      bandName: bandName || undefined,
    }));
  }

  private toDomain(review: any): Review {
    return {
      ...review,
      evidence: typeof review.evidence === 'string' ? JSON.parse(review.evidence) : (review.evidence || []),
    };
  }

  private toPersistence(review: Review): any {
    return {
      ...review,
      evidence: JSON.stringify(review.evidence),
    };
  }
}
