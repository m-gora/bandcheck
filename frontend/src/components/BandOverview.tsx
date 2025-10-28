import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BandCard from './BandCard';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useSearchParams } from 'react-router-dom';

// Sample band data
const sampleBands = [
  {
    id: '1',
    name: 'Arctic Monkeys',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=faces',
    genres: ['Indie Rock', 'Alternative Rock', 'Post-Punk Revival'],
    safetyStatus: 'safe' as const,
    reviewCount: 8,
    location: 'Sheffield, UK',
  },
  {
    id: '2',
    name: 'Billie Eilish',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop&crop=faces',
    genres: ['Pop', 'Electropop', 'Alternative Pop'],
    safetyStatus: 'safe' as const,
    reviewCount: 12,
    location: 'Los Angeles, CA',
  },
  {
    id: '3',
    name: 'The Strokes',
    image: 'https://images.unsplash.com/photo-1571974599782-87462d4d877b?w=400&h=300&fit=crop&crop=faces',
    genres: ['Garage Rock', 'Indie Rock', 'Post-Punk Revival'],
    safetyStatus: 'unsafe' as const,
    reviewCount: 6,
    location: 'New York, NY',
  },
  {
    id: '4',
    name: 'Tame Impala',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop&crop=faces',
    genres: ['Psychedelic Pop', 'Neo-Psychedelia', 'Synth-pop'],
    safetyStatus: 'safe' as const,
    reviewCount: 7,
    location: 'Perth, Australia',
  },
  {
    id: '5',
    name: 'Royal Blood',
    image: 'https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=400&h=300&fit=crop&crop=faces',
    genres: ['Hard Rock', 'Garage Rock', 'Blues Rock'],
    safetyStatus: 'pending' as const,
    reviewCount: 3,
    location: 'Brighton, UK',
  },
  {
    id: '6',
    name: 'Glass Animals',
    image: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=400&h=300&fit=crop&crop=faces',
    genres: ['Indie Pop', 'Psychedelic Pop', 'Electronic'],
    safetyStatus: 'safe' as const,
    reviewCount: 9,
    location: 'Oxford, UK',
  },
];

export default function BandOverview() {
  const [favoritedBands, setFavoritedBands] = React.useState<Set<string>>(new Set());
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get search query from URL params, default to empty string
  const searchQuery = searchParams.get('q') || '';

  const handleFavorite = (bandId: string) => {
    setFavoritedBands(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bandId)) {
        newSet.delete(bandId);
      } else {
        newSet.add(bandId);
      }
      return newSet;
    });
  };

  const handleSearchChange = (value: string) => {
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  // Filter bands based on search query
  const filteredBands = React.useMemo(() => {
    if (!searchQuery) return sampleBands;
    
    return sampleBands.filter(band => {
      return band.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             band.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
             band.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [searchQuery]);

  return (
    <Box sx={{ py: { xs: 8, sm: 12 }, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Stack spacing={3} sx={{ textAlign: 'center', mb: 6, alignItems: 'center' }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 'bold',
              color: 'text.primary',
              textAlign: 'center',
            }}
          >
            Discover Safe Music
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              lineHeight: 1.6,
              textAlign: 'center',
              width: '100%',
            }}
          >
            Browse our curated collection of artists with verified safety ratings. 
            Find your next favorite band while staying informed about content warnings.
          </Typography>
        </Stack>

        {/* Search and Filter Section */}
        <Box sx={{ mb: 6 }}>
          <Stack spacing={3} sx={{ maxWidth: '800px', mx: 'auto' }}>
            {/* Search Bar */}
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search bands, genres, or locations..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '12px',
                  backgroundColor: 'background.paper',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider',
                  },
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />

            {/* Search Results Info */}
            {searchQuery && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {filteredBands.length === 1 
                    ? `Found ${filteredBands.length} artist` 
                    : `Found ${filteredBands.length} artists`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </Typography>
                
                {searchQuery && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleSearchChange('')}
                    sx={{
                      textTransform: 'none',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.50',
                      },
                    }}
                  >
                    Clear search
                  </Button>
                )}
              </Box>
            )}
          </Stack>
        </Box>

        {/* Band Cards Grid */}
        {filteredBands.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 4,
              mb: 6,
            }}
          >
            {filteredBands.map((band) => (
              <BandCard
                key={band.id}
                band={band}
                onFavorite={handleFavorite}
                isFavorited={favoritedBands.has(band.id)}
              />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              mb: 6,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                mb: 2,
              }}
            >
              No artists found
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mb: 3,
              }}
            >
              {searchQuery
                ? 'Try adjusting your search criteria or clearing the search.'
                : 'No artists available at the moment.'}
            </Typography>
            {searchQuery && (
              <Button
                variant="outlined"
                onClick={() => handleSearchChange('')}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                }}
              >
                Clear search
              </Button>
            )}
          </Box>
        )}

        {/* View More Button */}
        {filteredBands.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: '12px',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
              }}
            >
              {searchQuery
                ? `View All ${filteredBands.length} Artists`
                : 'View All Artists'}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}