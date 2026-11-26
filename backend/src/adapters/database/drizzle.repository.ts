import { and, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db, bands, reviews } from '../../db';
import type { Band, Review, GetBandsQuery, GetBandsResult } from '../../core/domain/entities';
import type { BandRepository, ReviewRepository } from '../../core/ports/repositories';

type PublicBandRow = Pick<
  typeof bands.$inferSelect,
  | 'id'
  | 'maId'
  | 'name'
  | 'description'
  | 'genres'
  | 'location'
  | 'formed'
  | 'website'
  | 'imageUrl'
  | 'members'
  | 'safetyStatus'
  | 'reviewCount'
  | 'createdAt'
  | 'updatedAt'
>;

const publicBandColumns = {
  id: bands.id,
  maId: bands.maId,
  name: bands.name,
  description: bands.description,
  genres: bands.genres,
  location: bands.location,
  formed: bands.formed,
  website: bands.website,
  imageUrl: bands.imageUrl,
  members: bands.members,
  safetyStatus: bands.safetyStatus,
  reviewCount: bands.reviewCount,
  createdAt: bands.createdAt,
  updatedAt: bands.updatedAt,
};

export class DrizzleBandRepository implements BandRepository {
  async findAll(query: GetBandsQuery): Promise<GetBandsResult> {
    const { search, genre, limit = 50, offset = 0 } = query;
    
    // Apply filters
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(bands.name, `%${search}%`),
          ilike(bands.description, `%${search}%`)
        )
      );
    }
    if (genre) {
      conditions.push(
        sql`EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(${bands.genres}) AS item(value)
          WHERE item.value ILIKE ${`%${genre}%`}
        )`
      );
    }
    
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [countRows, rows] = await Promise.all([
      db.select({ total: count() }).from(bands).where(where),
      db.select(publicBandColumns)
        .from(bands)
        .where(where)
        .orderBy(asc(bands.name))
        .limit(limit)
        .offset(offset),
    ]);
    
    return {
      bands: rows.map((band) => this.toDomain(band)),
      total: countRows[0]?.total ?? 0,
    };
  }

  async findById(id: string): Promise<Band | null> {
    const [band] = await db.select(publicBandColumns).from(bands).where(eq(bands.id, id)).limit(1);
    if (!band) return null;
    return this.toDomain(band);
  }

  async create(band: Band): Promise<Band> {
    await db.insert(bands).values(this.toPersistence(band));
    return band;
  }

  async update(id: string, bandData: Partial<Band>): Promise<Band> {
    const { createdAt, updatedAt, ...fields } = bandData;
    const updateData: Partial<typeof bands.$inferInsert> = { ...fields };
    if (createdAt) updateData.createdAt = new Date(createdAt);
    if (updatedAt) updateData.updatedAt = new Date(updatedAt);

    await db.update(bands)
      .set(updateData)
      .where(eq(bands.id, id));

    const updated = await this.findById(id);
    if (!updated) throw new Error('Band not found after update');
    return updated;
  }

  async delete(id: string): Promise<void> {
    // First delete all reviews for this band
    await db.delete(reviews).where(eq(reviews.bandId, id));
    // Then delete the band
    await db.delete(bands).where(eq(bands.id, id));
  }

  async existsByName(name: string): Promise<boolean> {
    const existing = await db.select({ id: bands.id })
      .from(bands)
      .where(eq(bands.name, name))
      .limit(1);
    return existing.length > 0;
  }

  async existsByMaId(maId: string): Promise<boolean> {
    const existing = await db.select({ id: bands.id })
      .from(bands)
      .where(eq(bands.maId, maId))
      .limit(1);
    return existing.length > 0;
  }

  async getStatistics(): Promise<{ safe: number; unsafe: number; controversial: number; pending: number; total: number }> {
    const [stats] = await db.select({
      safe: sql<number>`count(*) FILTER (WHERE ${bands.safetyStatus} = 'safe')::int`,
      unsafe: sql<number>`count(*) FILTER (WHERE ${bands.safetyStatus} = 'unsafe')::int`,
      controversial: sql<number>`count(*) FILTER (WHERE ${bands.safetyStatus} = 'controversial')::int`,
      pending: sql<number>`count(*) FILTER (WHERE ${bands.safetyStatus} = 'pending')::int`,
      total: count(),
    }).from(bands);

    return stats ?? { safe: 0, unsafe: 0, controversial: 0, pending: 0, total: 0 };
  }

  async findLatest(limit: number): Promise<Band[]> {
    const latestBands = await db.select(publicBandColumns)
      .from(bands)
      .orderBy(desc(bands.createdAt))
      .limit(limit)
    
    return latestBands.map(band => this.toDomain(band));
  }

  private toDomain(band: PublicBandRow): Band {
    return {
      id: band.id,
      maId: band.maId ?? undefined,
      name: band.name,
      description: band.description,
      genres: this.parseJsonArray(band.genres),
      location: band.location ?? undefined,
      formed: band.formed ?? undefined,
      website: band.website ?? undefined,
      imageUrl: band.imageUrl ?? undefined,
      members: this.parseJsonArray(band.members),
      safetyStatus: band.safetyStatus as Band['safetyStatus'],
      reviewCount: band.reviewCount,
      createdAt: band.createdAt.toISOString(),
      updatedAt: band.updatedAt.toISOString(),
    };
  }

  private toPersistence(band: Band): typeof bands.$inferInsert {
    return {
      id: band.id,
      maId: band.maId ?? null,
      name: band.name,
      description: band.description ?? '',
      genres: band.genres,
      location: band.location ?? null,
      formed: band.formed ?? null,
      website: band.website ?? null,
      imageUrl: band.imageUrl ?? null,
      members: band.members ?? [],
      safetyStatus: band.safetyStatus,
      reviewCount: band.reviewCount,
      createdAt: new Date(band.createdAt),
      updatedAt: new Date(band.updatedAt),
    };
  }

  private parseJsonArray(value: unknown): string[] {
    if (Array.isArray(value)) return value as string[];
    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? parsed as string[] : [];
      } catch {
        return [];
      }
    }
    return [];
  }
}

export class DrizzleReviewRepository implements ReviewRepository {
  async findByBandId(bandId: string): Promise<Review[]> {
    const allReviews = await db.select()
      .from(reviews)
      .where(eq(reviews.bandId, bandId))
      .orderBy(desc(reviews.createdAt));
    
    return allReviews.map(review => this.toDomain(review));
  }

  async create(review: Review): Promise<Review> {
    await db.insert(reviews).values(this.toPersistence(review));
    return review;
  }

  async delete(id: string): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  async findLatest(limit: number): Promise<Array<Review & { bandName?: string }>> {
    const latestReviews = await db.select({
      review: reviews,
      bandName: bands.name,
    })
      .from(reviews)
      .leftJoin(bands, eq(reviews.bandId, bands.id))
      .orderBy(desc(reviews.createdAt))
      .limit(limit);
    
    return latestReviews.map(({ review, bandName }) => ({
      ...this.toDomain(review),
      bandName: bandName || undefined,
    }));
  }

  private toDomain(review: typeof reviews.$inferSelect): Review {
    return {
      ...review,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      evidence: Array.isArray(review.evidence)
        ? review.evidence
        : typeof review.evidence === 'string'
          ? JSON.parse(review.evidence)
          : [],
    } as Review;
  }

  private toPersistence(review: Review): typeof reviews.$inferInsert {
    return {
      id: review.id,
      bandId: review.bandId,
      userId: review.userId,
      userDisplayName: review.userDisplayName,
      userAvatarUrl: review.userAvatarUrl ?? null,
      safetyAssessment: review.safetyAssessment,
      comment: review.comment,
      evidence: review.evidence,
      createdAt: new Date(review.createdAt),
      updatedAt: new Date(review.updatedAt),
    };
  }
}
