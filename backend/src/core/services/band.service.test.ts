import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { BandServiceImpl, ReviewServiceImpl } from './band.service';
import type { BandRepository, ReviewRepository } from '../ports/repositories';
import type { Band, Review } from '../domain/entities';

const mockBand: Band = {
  id: 'test-id',
  name: 'Test Band',
  description: 'A test band',
  genres: ['Metal'],
  safetyStatus: 'pending',
  reviewCount: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockReview: Review = {
  id: 'review-1',
  bandId: 'test-id',
  userId: 'user-1',
  userDisplayName: 'Test User',
  safetyAssessment: 'safe',
  comment: 'Great band!',
  evidence: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

function makeBandRepo(overrides: Partial<BandRepository> = {}): BandRepository {
  return {
    findAll: mock(async () => ({ bands: [], total: 0 })),
    findById: mock(async () => null),
    create: mock(async (band: Band) => band),
    update: mock(async (_id: string, data: Partial<Band>) => ({ ...mockBand, ...data })),
    delete: mock(async () => {}),
    existsByName: mock(async () => false),
    existsByMaId: mock(async () => false),
    getStatistics: mock(async () => ({ safe: 0, unsafe: 0, controversial: 0, pending: 0, total: 0 })),
    findLatest: mock(async () => []),
    ...overrides,
  };
}

function makeReviewRepo(overrides: Partial<ReviewRepository> = {}): ReviewRepository {
  return {
    findByBandId: mock(async () => []),
    create: mock(async (review: Review) => review),
    delete: mock(async () => {}),
    findLatest: mock(async () => []),
    ...overrides,
  };
}

describe('BandServiceImpl', () => {
  describe('createBand', () => {
    it('creates a band successfully when no duplicates exist', async () => {
      const bandRepo = makeBandRepo();
      const service = new BandServiceImpl(bandRepo, makeReviewRepo());

      const result = await service.createBand({ name: 'New Band', genres: ['Metal'] }, 'user-1');

      expect(result.name).toBe('New Band');
      expect(result.safetyStatus).toBe('pending');
      expect(result.reviewCount).toBe(0);
      expect(result.genres).toEqual(['Metal']);
    });

    it('throws when band name already exists', async () => {
      const bandRepo = makeBandRepo({ existsByName: mock(async () => true) });
      const service = new BandServiceImpl(bandRepo, makeReviewRepo());

      await expect(
        service.createBand({ name: 'Existing Band', genres: ['Metal'] }, 'user-1')
      ).rejects.toThrow('A band with this name already exists');
    });

    it('throws when Metal Archives ID already exists', async () => {
      const bandRepo = makeBandRepo({
        existsByName: mock(async () => false),
        existsByMaId: mock(async () => true),
      });
      const service = new BandServiceImpl(bandRepo, makeReviewRepo());

      await expect(
        service.createBand({ name: 'New Band', genres: ['Metal'], maId: '12345' }, 'user-1')
      ).rejects.toThrow('A band with this name already exists');
    });

    it('sets default members to empty array when not provided', async () => {
      const service = new BandServiceImpl(makeBandRepo(), makeReviewRepo());

      const result = await service.createBand({ name: 'Band', genres: ['Rock'] }, 'user-1');

      expect(result.members).toEqual([]);
    });
  });

  describe('getBandDetails', () => {
    it('returns null when band does not exist', async () => {
      const service = new BandServiceImpl(makeBandRepo(), makeReviewRepo());

      const result = await service.getBandDetails('nonexistent');

      expect(result).toBeNull();
    });

    it('returns band with its reviews', async () => {
      const bandRepo = makeBandRepo({ findById: mock(async () => mockBand) });
      const reviewRepo = makeReviewRepo({ findByBandId: mock(async () => [mockReview]) });
      const service = new BandServiceImpl(bandRepo, reviewRepo);

      const result = await service.getBandDetails('test-id');

      expect(result).not.toBeNull();
      expect(result!.band).toEqual(mockBand);
      expect(result!.reviews).toHaveLength(1);
      expect(result!.reviews[0]).toEqual(mockReview);
    });

    it('returns band with empty reviews array when none exist', async () => {
      const bandRepo = makeBandRepo({ findById: mock(async () => mockBand) });
      const service = new BandServiceImpl(bandRepo, makeReviewRepo());

      const result = await service.getBandDetails('test-id');

      expect(result!.reviews).toEqual([]);
    });
  });

  describe('deleteBand', () => {
    it('throws when band does not exist', async () => {
      const service = new BandServiceImpl(makeBandRepo(), makeReviewRepo());

      await expect(service.deleteBand('nonexistent')).rejects.toThrow('Band not found');
    });

    it('deletes the band when it exists', async () => {
      const deleteMock = mock(async () => {});
      const bandRepo = makeBandRepo({
        findById: mock(async () => mockBand),
        delete: deleteMock,
      });
      const service = new BandServiceImpl(bandRepo, makeReviewRepo());

      await service.deleteBand('test-id');

      expect(deleteMock).toHaveBeenCalledWith('test-id');
    });
  });

  describe('updateBand', () => {
    it('throws when band does not exist', async () => {
      const service = new BandServiceImpl(makeBandRepo(), makeReviewRepo());

      await expect(service.updateBand('nonexistent', { name: 'New Name' })).rejects.toThrow('Band not found');
    });
  });
});

describe('ReviewServiceImpl', () => {
  describe('createReview', () => {
    it('throws when band does not exist', async () => {
      const service = new ReviewServiceImpl(makeReviewRepo(), makeBandRepo());

      await expect(
        service.createReview('nonexistent', { safetyAssessment: 'safe', comment: 'Good' }, 'user-1', 'User')
      ).rejects.toThrow('Band not found');
    });

    it('creates a review and returns it with correct fields', async () => {
      const bandRepo = makeBandRepo({ findById: mock(async () => mockBand) });
      const reviewRepo = makeReviewRepo({ findByBandId: mock(async () => []) });
      const service = new ReviewServiceImpl(reviewRepo, bandRepo);

      const result = await service.createReview(
        'test-id',
        { safetyAssessment: 'safe', comment: 'Great band!' },
        'user-1',
        'Test User'
      );

      expect(result.bandId).toBe('test-id');
      expect(result.userId).toBe('user-1');
      expect(result.userDisplayName).toBe('Test User');
      expect(result.safetyAssessment).toBe('safe');
      expect(result.comment).toBe('Great band!');
    });
  });

  describe('deleteReview', () => {
    it('recalculates band safety status after deletion', async () => {
      const updateMock = mock(async (_id: string, data: Partial<Band>) => ({ ...mockBand, ...data }));
      const bandRepo = makeBandRepo({ update: updateMock });
      // After deletion, no reviews remain → status should be 'pending'
      const reviewRepo = makeReviewRepo({ findByBandId: mock(async () => []) });
      const service = new ReviewServiceImpl(reviewRepo, bandRepo);

      await service.deleteReview('review-1', 'test-id');

      expect(updateMock).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining({ safetyStatus: 'pending', reviewCount: 0 })
      );
    });
  });
});
