import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Container,
  Divider,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Paper,
} from '@mui/material';
import {
  LocationOn,
  Language,
  CalendarToday,
  ArrowBack,
  Add,
  Shield,
  Person,
  Star,
  MusicNote,
} from '@mui/icons-material';
import { useBandDetails, useCreateReview } from '../hooks/useBands';
import { useAuth } from '../context/AuthContext';

const BandDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewError, setReviewError] = useState('');
  
  // Form state for new review
  const [reviewForm, setReviewForm] = useState({
    safetyAssessment: 'safe' as 'safe' | 'unsafe',
    comment: '',
    evidence: [''],
  });

  // Fetch band details
  const { data, isLoading, error } = useBandDetails(id!);
  
  // Create review mutation
  const createReviewMutation = useCreateReview(id!);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddEvidence = () => {
    setReviewForm(prev => ({
      ...prev,
      evidence: [...prev.evidence, '']
    }));
  };

  const handleEvidenceChange = (index: number, value: string) => {
    setReviewForm(prev => ({
      ...prev,
      evidence: prev.evidence.map((item, i) => i === index ? value : item)
    }));
  };

  const handleRemoveEvidence = (index: number) => {
    setReviewForm(prev => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.comment.trim()) {
      setReviewError('Review comment is required');
      return;
    }

    if (!isAuthenticated || !user) {
      setReviewError('You must be logged in to submit a review');
      return;
    }

    setReviewError(''); // Clear previous errors
    const filteredEvidence = reviewForm.evidence.filter(e => e.trim());
    
    try {
      await createReviewMutation.mutateAsync({
        safetyAssessment: reviewForm.safetyAssessment,
        comment: reviewForm.comment,
        evidence: filteredEvidence,
      });
      
      setReviewDialogOpen(false);
      setReviewError('');
      setReviewForm({
        safetyAssessment: 'safe',
        comment: '',
        evidence: [''],
      });
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      // Handle specific error cases
      if (error.message?.includes('already reviewed') || error.message?.includes('User has already reviewed this band')) {
        setReviewError('You have already submitted a review for this band. Each user can only submit one review per band.');
      } else if (error.message?.includes('unauthorized') || error.message?.includes('authentication')) {
        setReviewError('Authentication failed. Please log in again and try again.');
      } else {
        setReviewError(error.message || 'Failed to submit review. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSafetyColor = (status: string) => {
    switch (status) {
      case 'safe': return 'success';
      case 'unsafe': return 'error';
      default: return 'warning';
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ pt: { xs: 12, sm: 14 }, pb: 4 }}>
        <Skeleton variant="rectangular" width={100} height={40} sx={{ mb: 3 }} />
        <Skeleton variant="text" width="60%" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="100%" height={80} sx={{ mb: 4 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
          <Skeleton variant="rectangular" height={300} />
          <Skeleton variant="rectangular" height={300} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ pt: { xs: 12, sm: 14 }, pb: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error.message}
        </Alert>
        <Button onClick={handleBack} startIcon={<ArrowBack />}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!data) return null;

  const { band, reviews } = data;

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 12, sm: 14 }, pb: 4 }}>
      {/* Back Button */}
      <Button 
        onClick={handleBack} 
        startIcon={<ArrowBack />} 
        sx={{ mb: 3 }}
        variant="outlined"
      >
        Back to Bands
      </Button>

      {/* Band Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {band.name}
          </Typography>
          <Chip
            label={band.safetyStatus.charAt(0).toUpperCase() + band.safetyStatus.slice(1)}
            color={getSafetyColor(band.safetyStatus) as any}
            size="medium"
            icon={<Shield />}
          />
        </Stack>

        {/* Band Image and Description */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '200px 1fr' }, gap: 3, mb: 3 }}>
          {/* Band Image */}
          <Box
            sx={{
              height: { xs: 200, md: 200 },
              bgcolor: band.imageUrl ? 'transparent' : 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'grey.300',
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
              <MusicNote sx={{ fontSize: 64, color: 'grey.400' }} />
            )}
          </Box>

          {/* Description */}
          <Box>
            <Typography variant="body1" color="text.secondary" paragraph>
              {band.description}
            </Typography>
          </Box>
        </Box>

        {/* Band Details */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 3 }}>
          {band.location && (
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn color="action" />
              <Typography variant="body2">{band.location}</Typography>
            </Box>
          )}
          
          {band.website && (
            <Box display="flex" alignItems="center" gap={1}>
              <Language color="action" />
              <Typography 
                variant="body2" 
                component="a" 
                href={band.website}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textDecoration: 'none', color: 'primary.main' }}
              >
                Website
              </Typography>
            </Box>
          )}

          {band.formed && (
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarToday color="action" />
              <Typography variant="body2">Formed {band.formed}</Typography>
            </Box>
          )}
        </Stack>

        {/* Genres */}
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
          {band.genres.map((genre, index) => (
            <Chip key={index} label={genre} variant="outlined" color="primary" />
          ))}
        </Stack>

        {/* Stats */}
        <Box display="flex" gap={3}>
          <Typography variant="body2" color="text.secondary">
            {band.reviewCount} review{band.reviewCount !== 1 ? 's' : ''}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Added {formatDate(band.createdAt)}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Reviews Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
        
        {/* Reviews List */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2">
              Reviews ({reviews.length})
            </Typography>
            {isAuthenticated && (
              <Button
                onClick={() => {
                  setReviewError('');
                  setReviewDialogOpen(true);
                }}
                startIcon={<Add />}
                variant="contained"
              >
                Add Review
              </Button>
            )}
          </Stack>

          {reviews.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No reviews yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: isAuthenticated ? 0 : 2 }}>
                {isAuthenticated 
                  ? 'Be the first to review this band and help others make informed decisions.'
                  : 'Please log in to submit the first review for this band.'
                }
              </Typography>
              {!isAuthenticated && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/signin')}
                  sx={{ mt: 2 }}
                >
                  Sign In to Review
                </Button>
              )}
            </Paper>
          ) : (
            <Stack spacing={3}>
              {reviews.map((review) => (
                <Card key={review.id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar 
                          src={review.userAvatarUrl} 
                          sx={{ bgcolor: 'primary.main' }}
                        >
                          {!review.userAvatarUrl && <Person />}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {review.userDisplayName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(review.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={review.safetyAssessment.charAt(0).toUpperCase() + review.safetyAssessment.slice(1)}
                        color={getSafetyColor(review.safetyAssessment) as any}
                        size="small"
                      />
                    </Stack>

                    <Typography variant="body2" paragraph>
                      {review.comment}
                    </Typography>

                    {review.evidence.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                          Evidence:
                        </Typography>
                        <Stack spacing={0.5}>
                          {review.evidence.map((item, index) => (
                            <Typography key={index} variant="body2" sx={{ fontSize: '0.875rem' }}>
                              • {item}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>

        {/* Band Info Sidebar */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Info
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Safety Status
                  </Typography>
                  <Chip
                    label={band.safetyStatus.charAt(0).toUpperCase() + band.safetyStatus.slice(1)}
                    color={getSafetyColor(band.safetyStatus) as any}
                    size="small"
                  />
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Reviews
                  </Typography>
                  <Typography variant="body1">
                    {band.reviewCount}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(band.updatedAt)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Your Review</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {(reviewError || createReviewMutation.error) && (
              <Alert severity="error">
                {reviewError || createReviewMutation.error?.message}
              </Alert>
            )}
            
            <FormControl fullWidth>
              <InputLabel>Safety Assessment</InputLabel>
              <Select
                value={reviewForm.safetyAssessment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, safetyAssessment: e.target.value as 'safe' | 'unsafe' }))}
                label="Safety Assessment"
              >
                <MenuItem value="safe">Safe</MenuItem>
                <MenuItem value="unsafe">Unsafe</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Your Review"
              multiline
              rows={4}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your experience with this band..."
              fullWidth
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Evidence (optional)
              </Typography>
              {reviewForm.evidence.map((evidence, index) => (
                <Stack key={index} direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    size="small"
                    placeholder={`Evidence ${index + 1}`}
                    value={evidence}
                    onChange={(e) => handleEvidenceChange(index, e.target.value)}
                    fullWidth
                  />
                  {reviewForm.evidence.length > 1 && (
                    <Button
                      onClick={() => handleRemoveEvidence(index)}
                      size="small"
                      color="error"
                    >
                      Remove
                    </Button>
                  )}
                </Stack>
              ))}
              <Button onClick={handleAddEvidence} size="small">
                Add Evidence
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setReviewError('');
            setReviewDialogOpen(false);
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={createReviewMutation.isPending || !reviewForm.comment.trim()}
          >
            {createReviewMutation.isPending ? <CircularProgress size={20} /> : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BandDetails;