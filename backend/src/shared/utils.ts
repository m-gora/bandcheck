import { Band, Review, BandEntity, ReviewEntity } from './types.js';

// Utility functions for converting between domain models and Azure Table entities

export function bandToEntity(band: Band): BandEntity {
  return {
    partitionKey: 'band',
    rowKey: band.id,
    name: band.name,
    description: band.description,
    genres: JSON.stringify(band.genres),
    location: band.location,
    formed: band.formed,
    website: band.website,
    imageUrl: band.imageUrl,
    members: band.members ? JSON.stringify(band.members) : undefined,
    safetyStatus: band.safetyStatus,
    reviewCount: band.reviewCount,
    createdAt: band.createdAt,
    updatedAt: band.updatedAt,
  };
}

export function entityToBand(entity: BandEntity): Band {
  return {
    id: entity.rowKey,
    name: entity.name,
    description: entity.description,
    genres: JSON.parse(entity.genres),
    location: entity.location,
    formed: entity.formed,
    website: entity.website,
    imageUrl: entity.imageUrl,
    members: entity.members ? JSON.parse(entity.members) : undefined,
    safetyStatus: entity.safetyStatus,
    reviewCount: entity.reviewCount,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export function reviewToEntity(review: Review): ReviewEntity {
  return {
    partitionKey: review.bandId, // Partition by band ID for efficient querying
    rowKey: review.id,
    bandId: review.bandId,
    userId: review.userId,
    userDisplayName: review.userDisplayName,
    safetyAssessment: review.safetyAssessment,
    comment: review.comment,
    evidence: JSON.stringify(review.evidence),
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

export function entityToReview(entity: ReviewEntity): Review {
  return {
    id: entity.rowKey,
    bandId: entity.bandId,
    userId: entity.userId,
    userDisplayName: entity.userDisplayName,
    safetyAssessment: entity.safetyAssessment,
    comment: entity.comment,
    evidence: JSON.parse(entity.evidence),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

// Utility function to calculate safety status based on reviews
export function calculateSafetyStatus(reviews: Review[]): 'safe' | 'unsafe' | 'pending' {
  if (reviews.length < 5) {
    return 'pending';
  }

  const safeCount = reviews.filter(r => r.safetyAssessment === 'safe').length;
  const unsafeCount = reviews.filter(r => r.safetyAssessment === 'unsafe').length;
  
  // If more than 60% say safe, mark as safe
  // If more than 40% say unsafe, mark as unsafe
  // Otherwise, keep as pending
  const safePercentage = safeCount / reviews.length;
  const unsafePercentage = unsafeCount / reviews.length;
  
  if (safePercentage >= 0.6) {
    return 'safe';
  } else if (unsafePercentage >= 0.4) {
    return 'unsafe';
  } else {
    return 'pending';
  }
}

// Generate unique ID for entities
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}