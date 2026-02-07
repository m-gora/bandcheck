import type { Band, Review, CreateBandRequest, CreateReviewRequest, GetBandsQuery, GetBandsResult } from '../domain/entities';

// Repository ports (driven/secondary ports)
export interface BandRepository {
  findAll(query: GetBandsQuery): Promise<GetBandsResult>;
  findById(id: string): Promise<Band | null>;
  create(band: Band): Promise<Band>;
  update(id: string, band: Partial<Band>): Promise<Band>;
  existsByName(name: string): Promise<boolean>;
  getStatistics(): Promise<{ safe: number; unsafe: number; controversial: number; pending: number; total: number }>;
  findLatest(limit: number): Promise<Band[]>;
}

export interface ReviewRepository {
  findByBandId(bandId: string): Promise<Review[]>;
  create(review: Review): Promise<Review>;
  findLatest(limit: number): Promise<Array<Review & { bandName?: string }>>;
}

// Service ports (primary/driving ports)
export interface BandService {
  getAllBands(query: GetBandsQuery): Promise<GetBandsResult>;
  getBandDetails(id: string): Promise<{ band: Band; reviews: Review[] } | null>;
  createBand(data: CreateBandRequest, userId: string): Promise<Band>;
}

export interface ReviewService {
  createReview(bandId: string, data: CreateReviewRequest, userId: string, userName: string, userAvatar?: string): Promise<Review>;
}
