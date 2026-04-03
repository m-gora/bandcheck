// Core domain entities
export interface Band {
  id: string;
  maId?: string;
  name: string;
  description?: string;
  genres: string[];
  location?: string;
  formed?: string;
  website?: string;
  imageUrl?: string;
  members?: string[];
  safetyStatus: 'safe' | 'unsafe' | 'controversial' | 'pending';
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bandId: string;
  userId: string;
  userDisplayName: string;
  userAvatarUrl?: string;
  safetyAssessment: 'safe' | 'unsafe' | 'controversial';
  comment: string;
  evidence: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBandRequest {
  name: string;
  maId?: string;
  description?: string;
  genres: string[];
  location?: string;
  formed?: string;
  website?: string;
  imageUrl?: string;
  members?: string[];
  turnstileToken?: string;
}

export interface CreateReviewRequest {
  safetyAssessment: 'safe' | 'unsafe' | 'controversial';
  comment: string;
  evidence?: string[];
}

export interface GetBandsQuery {
  search?: string;
  genre?: string;
  limit?: number;
  offset?: number;
}

export interface GetBandsResult {
  bands: Band[];
  total: number;
}

export interface GetBandDetailsResult {
  band: Band;
  reviews: Review[];
}
