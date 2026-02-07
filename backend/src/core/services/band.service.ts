import type { Band, Review, CreateBandRequest, CreateReviewRequest, GetBandsQuery, GetBandsResult } from '../domain/entities';
import type { BandRepository, ReviewRepository } from '../ports/repositories';

export class BandServiceImpl {
  constructor(
    private bandRepo: BandRepository,
    private reviewRepo: ReviewRepository
  ) {}

  async getAllBands(query: GetBandsQuery): Promise<GetBandsResult> {
    return this.bandRepo.findAll(query);
  }

  async getBandDetails(id: string): Promise<{ band: Band; reviews: Review[] } | null> {
    const band = await this.bandRepo.findById(id);
    if (!band) return null;

    const reviews = await this.reviewRepo.findByBandId(id);
    return { band, reviews };
  }

  async createBand(data: CreateBandRequest, userId: string): Promise<Band> {
    // Check if band already exists
    const exists = await this.bandRepo.existsByName(data.name);
    if (exists) {
      throw new Error('A band with this name already exists');
    }

    const now = new Date().toISOString();
    const band: Band = {
      id: this.generateId(),
      name: data.name,
      description: data.description,
      genres: data.genres,
      location: data.location,
      formed: data.formed,
      website: data.website,
      imageUrl: data.imageUrl,
      members: data.members || [],
      safetyStatus: 'pending',
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    return this.bandRepo.create(band);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  async getStatistics(): Promise<{ safe: number; unsafe: number; controversial: number; pending: number; total: number }> {
    return this.bandRepo.getStatistics();
  }

  async getLatestBands(limit: number): Promise<Band[]> {
    return this.bandRepo.findLatest(limit);
  }
}

export class ReviewServiceImpl {
  constructor(
    private reviewRepo: ReviewRepository,
    private bandRepo: BandRepository
  ) {}

  async createReview(
    bandId: string,
    data: CreateReviewRequest,
    userId: string,
    userName: string,
    userAvatar?: string
  ): Promise<Review> {
    // Verify band exists
    const band = await this.bandRepo.findById(bandId);
    if (!band) {
      throw new Error('Band not found');
    }

    const now = new Date().toISOString();
    const review: Review = {
      id: this.generateId(),
      bandId,
      userId,
      userDisplayName: userName,
      userAvatarUrl: userAvatar,
      safetyAssessment: data.safetyAssessment,
      comment: data.comment,
      evidence: data.evidence || [],
      createdAt: now,
      updatedAt: now,
    };

    await this.reviewRepo.create(review);

    // Recalculate band safety status
    const allReviews = await this.reviewRepo.findByBandId(bandId);
    const newSafetyStatus = this.calculateSafetyStatus(allReviews);
    
    await this.bandRepo.update(bandId, {
      safetyStatus: newSafetyStatus,
      reviewCount: allReviews.length,
      updatedAt: now,
    });

    return review;
  }

  private calculateSafetyStatus(reviews: Review[]): 'safe' | 'unsafe' | 'controversial' | 'pending' {
    if (reviews.length === 0) return 'pending';
    
    const safeCount = reviews.filter(r => r.safetyAssessment === 'safe').length;
    const unsafeCount = reviews.filter(r => r.safetyAssessment === 'unsafe').length;
    const controversialCount = reviews.filter(r => r.safetyAssessment === 'controversial').length;
    
    // If any unsafe reviews, mark as unsafe
    if (unsafeCount > 0) return 'unsafe';
    
    // If any controversial reviews but no unsafe, mark as controversial
    if (controversialCount > 0) return 'controversial';
    
    // If only safe reviews, mark as safe
    if (safeCount > 0) return 'safe';
    
    return 'pending';
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  async getLatestReviews(limit: number): Promise<Array<Review & { bandName?: string }>> {
    return this.reviewRepo.findLatest(limit);
  }
}
