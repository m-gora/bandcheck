// Core data types for BandCheck application

export interface Band {
  id: string;
  name: string;
  description: string;
  genres: string[];
  location?: string;
  formed?: string;
  website?: string;
  imageUrl?: string;
  members?: string[];
  safetyStatus: 'safe' | 'unsafe' | 'pending';
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bandId: string;
  userId: string;
  userDisplayName: string;
  safetyAssessment: 'safe' | 'unsafe';
  comment: string;
  evidence: string[];
  createdAt: string;
  updatedAt: string;
}

// Azure Table Storage entity interfaces
export interface BandEntity {
  partitionKey: string; // Will use 'band' as partition key
  rowKey: string; // Will use band ID as row key
  name: string;
  description: string;
  genres: string; // JSON stringified array
  location?: string;
  formed?: string;
  website?: string;
  imageUrl?: string;
  members?: string; // JSON stringified array
  safetyStatus: 'safe' | 'unsafe' | 'pending';
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewEntity {
  partitionKey: string; // Will use bandId as partition key for efficient querying
  rowKey: string; // Will use review ID as row key
  bandId: string;
  userId: string;
  userDisplayName: string;
  safetyAssessment: 'safe' | 'unsafe';
  comment: string;
  evidence: string; // JSON stringified array
  createdAt: string;
  updatedAt: string;
}

// Request/Response types for API endpoints
export interface CreateBandRequest {
  name: string;
  description: string;
  genres: string[];
  location?: string;
  formed?: string;
  website?: string;
  imageUrl?: string;
  members?: string[];
}

export interface CreateReviewRequest {
  safetyAssessment: 'safe' | 'unsafe';
  comment: string;
  evidence: string[];
  userId: string;
  userDisplayName: string;
}

export interface GetBandsResponse {
  bands: Band[];
  total: number;
}

export interface GetBandDetailsResponse {
  band: Band;
  reviews: Review[];
}

// Utility type for converting between Band and BandEntity
export type BandEntityToConvert = Omit<BandEntity, 'partitionKey' | 'rowKey'>;
export type ReviewEntityToConvert = Omit<ReviewEntity, 'partitionKey' | 'rowKey'>;