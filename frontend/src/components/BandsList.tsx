import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Alert,
  Container,
  Skeleton,
} from '@mui/material';
import { LocationOn, Language, MusicNote } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBands } from '../hooks/useBands';
import { Band } from '../services/api';

const BandsList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Debounce search input to avoid too many API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300); // Wait 300ms after user stops typing
    
    return () => clearTimeout(timer);
  }, [search]);
  
  // Fetch bands with current filters (using debounced search)
  const { data, isLoading, error, refetch } = useBands(
    debouncedSearch || undefined,
    selectedGenre || undefined
  );

  const handleBandClick = React.useCallback((bandId: string) => {
    navigate(`/bands/${bandId}`);
  }, [navigate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const renderBandCard = React.useCallback((band: Band) => (
    <Card
      key={band.id}
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
      onClick={() => handleBandClick(band.id)}
    >
      {/* Band Image */}
      <Box
        sx={{
          height: 140,
          bgcolor: band.imageUrl ? 'transparent' : 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {band.imageUrl ? (
          <img
            src={band.imageUrl}
            alt={band.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <MusicNote sx={{ fontSize: 48, color: 'grey.400' }} />
        )}
      </Box>
      
      <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            {band.name}
          </Typography>
          
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {band.description}
          </Typography>

          <Stack spacing={1} sx={{ mb: 2 }}>
            {/* Genres */}
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {band.genres.map((genre: string, index: number) => (
                <Chip
                  key={index}
                  label={genre}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Stack>

            {/* Location */}
            {band.location && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {band.location}
                </Typography>
              </Box>
            )}

            {/* Website */}
            {band.website && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Language fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Website
                </Typography>
              </Box>
            )}
          </Stack>

          {/* Safety Status */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Chip
              label={band.safetyStatus.charAt(0).toUpperCase() + band.safetyStatus.slice(1)}
              color={
                band.safetyStatus === 'safe'
                  ? 'success'
                  : band.safetyStatus === 'unsafe'
                  ? 'error'
                  : 'warning'
              }
              size="small"
            />
            <Typography variant="caption" color="text.secondary">
              {band.reviewCount} review{band.reviewCount !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </CardContent>
      </Card>
  ), [handleBandClick]);

  const renderSkeletonCards = React.useMemo(() => (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} sx={{ height: '100%' }}>
          <CardContent>
            <Skeleton variant="text" width="80%" height={32} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="100%" height={20} />
            <Box sx={{ mt: 2, mb: 2 }}>
              <Skeleton variant="rectangular" width={60} height={24} sx={{ mr: 1, display: 'inline-block' }} />
              <Skeleton variant="rectangular" width={80} height={24} sx={{ display: 'inline-block' }} />
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Skeleton variant="rectangular" width={80} height={24} />
              <Skeleton variant="text" width={60} height={16} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </>
  ), []);

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 12, sm: 14 }, pb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom textAlign="center">
        Explore Bands
      </Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
        Discover and review local bands. Help build a safer music community.
      </Typography>

      {/* Search and Filter Controls */}
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            label="Search bands..."
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Genre</InputLabel>
            <Select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              label="Genre"
            >
              <MenuItem value="">All Genres</MenuItem>
              <MenuItem value="Rock">Rock</MenuItem>
              <MenuItem value="Pop">Pop</MenuItem>
              <MenuItem value="Hip Hop">Hip Hop</MenuItem>
              <MenuItem value="Electronic">Electronic</MenuItem>
              <MenuItem value="Country">Country</MenuItem>
              <MenuItem value="Jazz">Jazz</MenuItem>
              <MenuItem value="Classical">Classical</MenuItem>
              <MenuItem value="Alternative">Alternative</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={20} /> : 'Search'}
          </Button>
        </Stack>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          Error loading bands: {error.message}
        </Alert>
      )}

      {/* Results */}
      {data && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {data.bands.length} of {data.total} bands
        </Typography>
      )}

      {/* Bands Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {isLoading
          ? renderSkeletonCards
          : data?.bands.map(renderBandCard)
        }
      </Box>

      {/* No Results */}
      {!isLoading && data?.bands.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" gutterBottom>
            No bands found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or add a new band to get started.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default BandsList;