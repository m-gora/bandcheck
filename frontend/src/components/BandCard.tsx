import * as React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Stack,
  Box,
  IconButton,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShieldIcon from '@mui/icons-material/Shield';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Band {
  id: string;
  name: string;
  image: string;
  genres: string[];
  safetyStatus: 'safe' | 'unsafe' | 'pending';
  reviewCount: number;
  location?: string;
}

interface BandCardProps {
  band: Band;
  onFavorite?: (bandId: string) => void;
  isFavorited?: boolean;
}

const getSafetyColor = (status: string) => {
  switch (status) {
    case 'safe': return '#4caf50'; // Green
    case 'unsafe': return '#f44336'; // Red
    case 'pending': return '#757575'; // Gray
    default: return '#757575';
  }
};

const getSafetyLabel = (status: string, reviewCount: number) => {
  switch (status) {
    case 'safe': return 'Safe';
    case 'unsafe': return 'Unsafe';
    case 'pending': return reviewCount < 5 ? 'Pending' : 'Under Review';
    default: return 'Unknown';
  }
};

export default function BandCard({ band, onFavorite, isFavorited = false }: BandCardProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(band.id);
  };

  const handleCardClick = () => {
    navigate(`/artist/${band.id}`);
  };

  const safetyColor = getSafetyColor(band.safetyStatus);
  const safetyLabel = getSafetyLabel(band.safetyStatus, band.reviewCount);

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      {/* Image with Safety Rating Overlay */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={band.image}
          alt={band.name}
          sx={{
            objectFit: 'cover',
            backgroundColor: 'grey.200',
          }}
        />
        
        {/* Safety Rating Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <ShieldIcon 
            sx={{ 
              fontSize: '16px', 
              color: safetyColor,
            }} 
          />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 'bold',
              color: safetyColor,
              fontSize: '0.75rem',
            }}
          >
            {safetyLabel}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              ml: 0.5,
              color: 'text.secondary',
              fontSize: '0.7rem',
            }}
          >
            {band.reviewCount} review{band.reviewCount !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Favorite Button - Only show when authenticated */}
        {isAuthenticated && (
          <IconButton
            onClick={handleFavorite}
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              width: '36px',
              height: '36px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.1)',
              },
            }}
          >
            {isFavorited ? (
              <FavoriteIcon sx={{ color: '#f44336', fontSize: '20px' }} />
            ) : (
              <FavoriteBorderIcon sx={{ color: 'grey.600', fontSize: '20px' }} />
            )}
          </IconButton>
        )}
      </Box>

      {/* Card Content */}
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Stack spacing={2}>
          {/* Band Name */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              lineHeight: 1.2,
            }}
          >
            {band.name}
          </Typography>

          {/* Location */}
          {band.location && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.875rem',
              }}
            >
              {band.location}
            </Typography>
          )}

          {/* Genre Pills */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {band.genres.slice(0, 3).map((genre, index) => (
              <Chip
                key={index}
                label={genre}
                size="small"
                sx={{
                  backgroundColor: 'primary.50',
                  color: 'primary.700',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  height: '24px',
                  '& .MuiChip-label': {
                    px: 1.5,
                  },
                }}
              />
            ))}
            {band.genres.length > 3 && (
              <Chip
                label={`+${band.genres.length - 3}`}
                size="small"
                sx={{
                  backgroundColor: 'grey.100',
                  color: 'grey.700',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  height: '24px',
                  '& .MuiChip-label': {
                    px: 1.5,
                  },
                }}
              />
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}