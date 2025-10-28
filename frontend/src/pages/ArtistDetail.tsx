import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Button,
  Card,
  CardContent,
  Avatar,
  Divider,
  IconButton,
  Paper,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../context/AuthContext';

// Sample band data (in real app, this would come from an API)
const sampleBands = [
  {
    id: '1',
    name: 'Arctic Monkeys',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=faces',
    genres: ['Indie Rock', 'Alternative Rock', 'Post-Punk Revival'],
    safetyStatus: 'safe' as const,
    reviewCount: 8,
    location: 'Sheffield, UK',
    description: 'Arctic Monkeys are an English rock band formed in Sheffield in 2002. The group consists of Alex Turner, Matt Helders, Jamie Cook, and Nick O\'Malley. Former band member Andy Nicholson left the band in 2006 shortly after their debut album was released.',
    members: ['Alex Turner', 'Matt Helders', 'Jamie Cook', 'Nick O\'Malley'],
    formed: '2002',
    website: 'https://arcticmonkeys.com',
  },
  {
    id: '2',
    name: 'Billie Eilish',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop&crop=faces',
    genres: ['Pop', 'Electropop', 'Alternative Pop'],
    safetyStatus: 'safe' as const,
    reviewCount: 12,
    location: 'Los Angeles, CA',
    description: 'Billie Eilish Pirate Baird O\'Connell is an American singer-songwriter. She first gained public attention in 2015 with her debut single "Ocean Eyes", which was written and produced by her brother Finneas O\'Connell.',
    members: ['Billie Eilish'],
    formed: '2015',
    website: 'https://billieeilish.com',
  },
  {
    id: '3',
    name: 'The Strokes',
    image: 'https://images.unsplash.com/photo-1571974599782-87462d4d877b?w=800&h=600&fit=crop&crop=faces',
    genres: ['Garage Rock', 'Indie Rock', 'Post-Punk Revival'],
    safetyStatus: 'unsafe' as const,
    reviewCount: 6,
    location: 'New York, NY',
    description: 'The Strokes are an American rock band from New York City. Formed in 1998, the band is composed of Julian Casablancas, Nick Valensi, Albert Hammond Jr., Nikolai Fraiture, and Fabrizio Moretti.',
    members: ['Julian Casablancas', 'Nick Valensi', 'Albert Hammond Jr.', 'Nikolai Fraiture', 'Fabrizio Moretti'],
    formed: '1998',
    website: 'https://thestrokes.com',
  },
];

// Sample reviews data
const sampleReviews = [
  {
    id: '1',
    bandId: '1',
    reviewerName: 'Sarah M.',
    reviewerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c093?w=40&h=40&fit=crop&crop=face',
    safetyStatus: 'safe',
    title: 'Great for most audiences',
    comment: 'Arctic Monkeys generally have clean lyrics and positive themes. Their music is suitable for most age groups with occasional mild language.',
    evidence: [
      'Reviewed 50+ songs from their discography',
      'Mild profanity in 3 songs (clearly marked)',
      'No explicit sexual content or extreme violence',
      'Positive themes about relationships and life experiences'
    ],
    date: '2024-10-15',
    helpful: 23,
  },
  {
    id: '2',
    bandId: '1',
    reviewerName: 'Mike R.',
    reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    safetyStatus: 'safe',
    title: 'Family-friendly with minor exceptions',
    comment: 'Most of their catalog is appropriate for family listening. Some songs from earlier albums contain mild language but nothing extreme.',
    evidence: [
      'Analyzed lyrics from all 7 studio albums',
      'Occasional use of mild profanity (damn, hell)',
      'No drug references or explicit content',
      'Concert footage shows respectful audience interaction'
    ],
    date: '2024-10-12',
    helpful: 18,
  },
  {
    id: '3',
    bandId: '2',
    reviewerName: 'Emma K.',
    reviewerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    safetyStatus: 'safe',
    title: 'Excellent role model for young listeners',
    comment: 'Billie Eilish creates music with thoughtful messages about mental health, self-acceptance, and social issues. Very appropriate content.',
    evidence: [
      'Comprehensive review of 3 studio albums and EPs',
      'Promotes mental health awareness and body positivity',
      'No explicit language or inappropriate content',
      'Actively speaks against bullying and promotes kindness',
      'Age-appropriate themes despite dealing with serious topics'
    ],
    date: '2024-10-20',
    helpful: 45,
  },
  {
    id: '4',
    bandId: '3',
    reviewerName: 'David L.',
    reviewerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    safetyStatus: 'unsafe',
    title: 'Content requires parental awareness',
    comment: 'The Strokes have content that contains themes parents should be aware of, particularly around drinking, nightlife, and adult relationships.',
    evidence: [
      'Reviewed 6 studio albums and major singles',
      'Multiple songs reference drinking and nightlife culture',
      'Occasional profanity throughout discography',
      'Adult themes around relationships and urban life',
      'Some content not suitable for younger listeners without context'
    ],
    date: '2024-10-08',
    helpful: 12,
  }
];

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

const getSafetyStatusColor = (status: string) => {
  switch (status) {
    case 'safe': return '#4caf50';
    case 'caution': return '#ff9800';
    case 'unsafe': return '#f44336';
    default: return '#757575';
  }
};

const getSafetyStatusIcon = (status: string) => {
  switch (status) {
    case 'safe': return <CheckCircleIcon />;
    case 'caution': return <WarningIcon />;
    case 'unsafe': return <WarningIcon />;
    default: return <ShieldIcon />;
  }
};

export default function ArtistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = React.useState(false);

  // Find the band data (in real app, this would be an API call)
  const band = sampleBands.find(b => b.id === id);
  const reviews = sampleReviews.filter(r => r.bandId === id);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  if (!band) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4">Artist not found</Typography>
        <Button onClick={() => navigate('/discover')} sx={{ mt: 2 }}>
          Back to Discover
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 8, sm: 12 }, backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/discover')}
          sx={{
            mb: 4,
            color: 'text.secondary',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          Back to Discover
        </Button>

        {/* Artist Header */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '20px',
            overflow: 'hidden',
            mb: 6,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ position: 'relative' }}>
            {/* Hero Image */}
            <Box
              component="img"
              src={band.image}
              alt={band.name}
              sx={{
                width: '100%',
                height: { xs: '200px', md: '300px' },
                objectFit: 'cover',
                display: 'block',
              }}
            />
            
            {/* Safety Badge */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: getSafetyColor(band.safetyStatus),
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontWeight: 'bold',
                fontSize: '0.875rem',
              }}
            >
              <ShieldIcon sx={{ fontSize: '18px' }} />
              {getSafetyLabel(band.safetyStatus, band.reviewCount)}
            </Box>

            {/* Favorite Button */}
            {isAuthenticated && (
              <IconButton
                onClick={handleFavorite}
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                {isFavorited ? (
                  <FavoriteIcon sx={{ color: '#f44336' }} />
                ) : (
                  <FavoriteBorderIcon sx={{ color: 'grey.600' }} />
                )}
              </IconButton>
            )}
          </Box>

          {/* Artist Info */}
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: { xs: '2rem', md: '3rem' },
                      mb: 1,
                    }}
                  >
                    {band.name}
                  </Typography>
                  
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <LocationOnIcon sx={{ color: 'text.secondary', fontSize: '20px' }} />
                    <Typography variant="body1" color="text.secondary">
                      {band.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Formed {band.formed}
                    </Typography>
                  </Stack>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      backgroundColor: getSafetyColor(band.safetyStatus),
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      mb: 1,
                    }}
                  >
                    <ShieldIcon sx={{ fontSize: '16px' }} />
                    {getSafetyLabel(band.safetyStatus, band.reviewCount)}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Based on {band.reviewCount} review{band.reviewCount !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Stack>

              {/* Genres */}
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {band.genres.slice(0, 3).map((genre) => (
                  <Chip
                    key={genre}
                    label={genre}
                    size="medium"
                    sx={{
                      backgroundColor: 'primary.50',
                      color: 'primary.700',
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Stack>

              {/* Description */}
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.7,
                  maxWidth: '800px',
                }}
              >
                {band.description}
              </Typography>

              {/* Band Members */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Members
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {band.members.join(' • ')}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>

        {/* Reviews Section */}
        <Box>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 'bold',
              mb: 3,
              fontSize: { xs: '1.75rem', md: '2.25rem' },
            }}
          >
            Safety Reviews ({reviews.length})
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mb: 4,
              maxWidth: '700px',
              lineHeight: 1.6,
            }}
          >
            These reviews are submitted by community members who have analyzed the artist's content
            for safety and appropriateness. Each review includes evidence to support their assessment.
          </Typography>

          <Stack spacing={3}>
            {reviews.map((review) => (
              <Card
                key={review.id}
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'visible',
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Stack spacing={3}>
                    {/* Review Header */}
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar
                        src={review.reviewerAvatar}
                        alt={review.reviewerName}
                        sx={{ width: 48, height: 48 }}
                      />
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {review.reviewerName}
                          </Typography>
                          
                          {/* Safety Status Badge */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              backgroundColor: getSafetyStatusColor(review.safetyStatus),
                              color: 'white',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                            }}
                          >
                            {getSafetyStatusIcon(review.safetyStatus)}
                            {review.safetyStatus}
                          </Box>
                          
                          <Typography variant="caption" color="text.secondary">
                            {new Date(review.date).toLocaleDateString()}
                          </Typography>
                        </Stack>
                        

                        
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                          {review.title}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Review Content */}
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.6,
                      }}
                    >
                      {review.comment}
                    </Typography>

                    {/* Evidence Section */}
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                        Supporting Evidence:
                      </Typography>
                      <Stack spacing={1}>
                        {review.evidence.map((item, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: 'primary.main',
                                mt: 1,
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {item}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    <Divider />

                    {/* Review Actions */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {review.helpful} people found this helpful
                      </Typography>
                      
                      <Button
                        variant="text"
                        size="small"
                        sx={{
                          textTransform: 'none',
                          color: 'primary.main',
                        }}
                      >
                        Helpful
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Add Review Button */}
          {isAuthenticated && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/artist/${id}/review`)}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 'bold',
                }}
              >
                Write a Safety Review
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}