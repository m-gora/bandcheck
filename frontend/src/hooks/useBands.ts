// Custom hooks for bands data fetching using TanStack Query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreateBandRequest } from '../services/api';

// Query keys for cache invalidation
export const bandKeys = {
  all: ['bands'] as const,
  lists: () => [...bandKeys.all, 'list'] as const,
  list: (filters: { search?: string; genre?: string }) => [...bandKeys.lists(), filters] as const,
  details: () => [...bandKeys.all, 'detail'] as const,
  detail: (id: string) => [...bandKeys.details(), id] as const,
} as const;

// Hook for fetching bands list with optional filters
export function useBands(search?: string, genre?: string) {
  return useQuery({
    queryKey: bandKeys.list({ search, genre }),
    queryFn: () => api.getBands(search, genre),
    enabled: true,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });
}

// Hook for fetching a specific band's details
export function useBandDetails(bandId: string) {
  return useQuery({
    queryKey: bandKeys.detail(bandId),
    queryFn: () => api.getBandDetails(bandId),
    enabled: !!bandId, // Only fetch when bandId is provided
  });
}

// Hook for creating a new band
export function useCreateBand() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (band: CreateBandRequest) => api.createBand(band),
    onSuccess: () => {
      // Invalidate and refetch bands list after successful creation
      queryClient.invalidateQueries({ queryKey: bandKeys.lists() });
    },
  });
}

// Hook for creating a review
export function useCreateReview(bandId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (review: Parameters<typeof api.createReview>[1]) => 
      api.createReview(bandId, review),
    onSuccess: () => {
      // Invalidate both the specific band details and the bands list
      queryClient.invalidateQueries({ queryKey: bandKeys.detail(bandId) });
      queryClient.invalidateQueries({ queryKey: bandKeys.lists() });
    },
  });
}