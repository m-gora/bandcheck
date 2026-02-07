import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Avatar,
  Divider,
  Paper,
  CircularProgress,
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningIcon from '@mui/icons-material/Warning';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function SafetyReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [statistics, setStatistics] = React.useState({
    safe: 0,
    unsafe: 0,
    controversial: 0,
    pending: 0,
    total: 0,
  });
  const [latestBands, setLatestBands] = React.useState<any[]>([]);
  const [latestReviews, setLatestReviews] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stats, bands, reviews] = await Promise.all([
          api.getStatistics(),
          api.getLatestBands(5),
          api.getLatestReviews(5),
        ]);
        setStatistics(stats);
        setLatestBands(bands);
        setLatestReviews(reviews);
      } catch (error) {
        console.error('Failed to fetch safety reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSafetyColor = (status: 'safe' | 'unsafe' | 'controversial' | 'pending') => {
    switch (status) {
      case 'safe':
        return 'success';
      case 'unsafe':
        return 'error';
      case 'controversial':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  const getSafetyIcon = (status: 'safe' | 'unsafe' | 'controversial' | 'pending') => {
    switch (status) {
      case 'safe':
        return <VerifiedUserIcon />;
      case 'unsafe':
        return <WarningIcon />;
      case 'controversial':
        return <WarningIcon />;
      case 'pending':
      default:
        return <HelpOutlineIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8, mt: 8 }}>
      <Stack spacing={6}>
        {/* Header */}
        <Box>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              background: 'linear-gradient(45deg, hsl(273, 91.6%, 58%), hsl(290, 85%, 65%))',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Safety Reports & Statistics
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Community-driven safety assessments and database insights
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            gap: 3,
          }}
        >
          <Card
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                color: 'white',
              }}
            >
              <CardContent>
                <Stack spacing={2} alignItems="center" textAlign="center">
                  <VerifiedUserIcon sx={{ fontSize: 48 }} />
                  <Typography variant="h3" fontWeight="bold">
                    {statistics.safe}
                  </Typography>
                  <Typography variant="h6">Safe Bands</Typography>
                </Stack>
              </CardContent>
            </Card>

          <Card
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
                color: 'white',
              }}
            >
              <CardContent>
                <Stack spacing={2} alignItems="center" textAlign="center">
                  <WarningIcon sx={{ fontSize: 48 }} />
                  <Typography variant="h3" fontWeight="bold">
                    {statistics.unsafe}
                  </Typography>
                  <Typography variant="h6">Unsafe Bands</Typography>
                </Stack>
              </CardContent>
            </Card>

          <Card
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #ff9800 0%, #ffa726 100%)',
                color: 'white',
              }}
            >
              <CardContent>
                <Stack spacing={2} alignItems="center" textAlign="center">
                  <WarningIcon sx={{ fontSize: 48 }} />
                  <Typography variant="h3" fontWeight="bold">
                    {statistics.controversial}
                  </Typography>
                  <Typography variant="h6">Controversial</Typography>
                </Stack>
              </CardContent>
            </Card>

          <Card
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)',
                color: 'white',
              }}
            >
              <CardContent>
                <Stack spacing={2} alignItems="center" textAlign="center">
                  <HelpOutlineIcon sx={{ fontSize: 48 }} />
                  <Typography variant="h3" fontWeight="bold">
                    {statistics.pending}
                  </Typography>
                  <Typography variant="h6">Pending Review</Typography>
                </Stack>
              </CardContent>
            </Card>

          <Card
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, hsl(273, 91.6%, 58%), hsl(290, 85%, 65%))',
                color: 'white',
              }}
            >
              <CardContent>
                <Stack spacing={2} alignItems="center" textAlign="center">
                  <TrendingUpIcon sx={{ fontSize: 48 }} />
                  <Typography variant="h3" fontWeight="bold">
                    {statistics.total}
                  </Typography>
                  <Typography variant="h6">Total Bands</Typography>
                </Stack>
              </CardContent>
            </Card>
        </Box>

        {/* Latest Bands Added */}
        <Paper elevation={2} sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="primary" />
              <Typography variant="h5" fontWeight="bold">
                Latest Bands Added
              </Typography>
            </Box>
            <Divider />
            <Stack spacing={2}>
              {latestBands.length === 0 ? (
                <Typography color="text.secondary">No bands added yet</Typography>
              ) : (
                latestBands.map((band) => (
                  <Card
                    key={band.id}
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateX(8px)',
                      },
                    }}
                    onClick={() => navigate(`/artist/${band.id}`)}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={band.imageUrl}
                          alt={band.name}
                          sx={{ width: 56, height: 56 }}
                        >
                          {band.name[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {band.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {band.genres.join(', ')}
                          </Typography>
                        </Box>
                        <Stack spacing={1} alignItems="flex-end">
                          <Chip
                            icon={getSafetyIcon(band.safetyStatus)}
                            label={band.safetyStatus.toUpperCase()}
                            color={getSafetyColor(band.safetyStatus)}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(band.createdAt)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          </Stack>
        </Paper>

        {/* Latest Reviews */}
        <Paper elevation={2} sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RateReviewIcon color="primary" />
              <Typography variant="h5" fontWeight="bold">
                Latest Community Reviews
              </Typography>
            </Box>
            <Divider />
            <Stack spacing={2}>
              {latestReviews.length === 0 ? (
                <Typography color="text.secondary">No reviews submitted yet</Typography>
              ) : (
                latestReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            src={review.userAvatarUrl}
                            alt={review.userDisplayName}
                          >
                            {review.userDisplayName[0]}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {review.userDisplayName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(review.createdAt)}
                            </Typography>
                          </Box>
                          <Chip
                            icon={
                              review.safetyAssessment === 'safe' ? (
                                <VerifiedUserIcon />
                              ) : (
                                <WarningIcon />
                              )
                            }
                            label={review.safetyAssessment.toUpperCase()}
                            color={
                              review.safetyAssessment === 'safe' 
                                ? 'success' 
                                : review.safetyAssessment === 'controversial'
                                ? 'warning'
                                : 'error'
                            }
                            size="small"
                          />
                        </Stack>
                        <Typography variant="body2">{review.comment}</Typography>
                        {review.bandName && (
                          <Typography
                            variant="caption"
                            color="primary"
                            sx={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/artist/${review.bandId}`)}
                          >
                            Review for: {review.bandName}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
