// API service functions for BandCheck backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api';

// Auth token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

// Types (these should eventually be shared between frontend and backend)
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
  userAvatarUrl?: string;
  safetyAssessment: 'safe' | 'unsafe';
  comment: string;
  evidence: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GetBandsResponse {
  bands: Band[];
  total: number;
}

export interface GetBandDetailsResponse {
  band: Band;
  reviews: Review[];
}

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
  userAvatarUrl?: string;
}

// API functions
export const api = {
  // Get all bands with optional search and genre filters
  getBands: async (search?: string, genre?: string): Promise<GetBandsResponse> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (genre) params.append('genre', genre);
    
    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}/bands?${queryString}` : `${API_BASE_URL}/bands`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch bands: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get specific band details with reviews
  getBandDetails: async (bandId: string): Promise<GetBandDetailsResponse> => {
    const response = await fetch(`${API_BASE_URL}/bands/${bandId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Band not found');
      }
      throw new Error(`Failed to fetch band details: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },

  // Create a new band
  createBand: async (band: CreateBandRequest): Promise<{ message: string; bandId: string; band: Band }> => {
    const response = await fetch(`${API_BASE_URL}/bands`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(band),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `Failed to create band: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },

  // Create a review for a band
  createReview: async (bandId: string, review: CreateReviewRequest): Promise<{
    message: string;
    reviewId: string;
    review: Review;
    updatedBand: { safetyStatus: Band['safetyStatus']; reviewCount: number };
  }> => {
    const response = await fetch(`${API_BASE_URL}/bands/${bandId}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(review),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `Failed to create review: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },
};