import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  TextField,
  Button,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { useAuth } from '../context/AuthContext';

// Sample band data (same as used elsewhere - in real app would come from API)
const sampleBands = [
  {
    id: '1',
    name: 'Arctic Monkeys',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=faces',
    genres: ['Indie Rock', 'Alternative Rock', 'Post-Punk Revival'],
  },
  {
    id: '2',
    name: 'Billie Eilish',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop&crop=faces',
    genres: ['Pop', 'Electropop', 'Alternative Pop'],
  },
  {
    id: '3',
    name: 'The Strokes',
    image: 'https://images.unsplash.com/photo-1571974599782-87462d4d877b?w=400&h=300&fit=crop&crop=faces',
    genres: ['Garage Rock', 'Indie Rock', 'Post-Punk Revival'],
  },
];

interface ReviewFormData {
  safetyStatus: 'safe' | 'unsafe' | '';
  title: string;
  comment: string;
  evidence: string[];
}

export default function WriteReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = React.useState<ReviewFormData>({
    safetyStatus: '',
    title: '',
    comment: '',
    evidence: [],
  });
  
  const [evidenceInput, setEvidenceInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  // Find the band data
  const band = sampleBands.find(b => b.id === id);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (field: keyof Pick<ReviewFormData, 'title' | 'comment'>) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSafetyStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      safetyStatus: event.target.value as 'safe' | 'unsafe',
    }));
  };

  const handleAddEvidence = () => {
    if (evidenceInput.trim() && !formData.evidence.includes(evidenceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        evidence: [...prev.evidence, evidenceInput.trim()],
      }));
      setEvidenceInput('');
    }
  };

  const handleRemoveEvidence = (evidenceToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence.filter(item => item !== evidenceToRemove),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validation
    if (!formData.safetyStatus) {
      setError('Please select a safety status');
      return;
    }
    
    if (!formData.title.trim()) {
      setError('Review title is required');
      return;
    }
    
    if (!formData.comment.trim()) {
      setError('Review comment is required');
      return;
    }
    
    if (formData.evidence.length === 0) {
      setError('Please provide at least one piece of supporting evidence');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real app, this would be an API call
      console.log('Submitting review:', {
        bandId: id,
        ...formData,
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      
      // Redirect back to artist page after success
      setTimeout(() => {
        navigate(`/artist/${id}`);
      }, 2000);
      
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

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
      <Container maxWidth="md">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/artist/${id}`)}
          sx={{
            mb: 4,
            color: 'text.secondary',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          Back to {band.name}
        </Button>

        {/* Header */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            Write Safety Review
          </Typography>
          
          {/* Artist Info */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              backgroundColor: 'background.paper',
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              component="img"
              src={band.image}
              alt={band.name}
              sx={{
                width: 60,
                height: 60,
                borderRadius: '8px',
                objectFit: 'cover',
              }}
            />
            
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {band.name}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {band.genres.slice(0, 2).map((genre) => (
                  <Chip
                    key={genre}
                    label={genre}
                    size="small"
                    sx={{
                      backgroundColor: 'primary.50',
                      color: 'primary.700',
                      fontSize: '0.75rem',
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Box>
          
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: '700px',
            }}
          >
            Help other users by providing an honest assessment of {band.name}'s content safety. 
            Your review should be based on thorough analysis and include supporting evidence.
          </Typography>
        </Stack>

        {/* Form */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '20px',
            p: { xs: 3, md: 4 },
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {success ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" sx={{ color: 'success.main', mb: 2 }}>
                Review Submitted Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Thank you for your contribution. Your review will help other users make informed decisions.
                Redirecting back to {band.name}...
              </Typography>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                {error && (
                  <Alert severity="error" sx={{ borderRadius: '12px' }}>
                    {error}
                  </Alert>
                )}

                {/* Safety Status */}
                <FormControl component="fieldset">
                  <FormLabel 
                    component="legend"
                    sx={{ 
                      fontWeight: 'bold',
                      color: 'text.primary',
                      mb: 2,
                    }}
                  >
                    Safety Assessment *
                  </FormLabel>
                  <RadioGroup
                    value={formData.safetyStatus}
                    onChange={handleSafetyStatusChange}
                  >
                    <FormControlLabel
                      value="safe"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: '20px' }} />
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              Safe
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Content is appropriate for most audiences
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ 
                        mb: 2,
                        p: 2,
                        border: '1px solid',
                        borderColor: formData.safetyStatus === 'safe' ? 'success.main' : 'divider',
                        borderRadius: '12px',
                        backgroundColor: formData.safetyStatus === 'safe' ? 'success.50' : 'transparent',
                      }}
                    />
                    
                    <FormControlLabel
                      value="unsafe"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WarningIcon sx={{ color: 'error.main', fontSize: '20px' }} />
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              Unsafe
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Content may not be suitable for all audiences
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ 
                        p: 2,
                        border: '1px solid',
                        borderColor: formData.safetyStatus === 'unsafe' ? 'error.main' : 'divider',
                        borderRadius: '12px',
                        backgroundColor: formData.safetyStatus === 'unsafe' ? 'error.50' : 'transparent',
                      }}
                    />
                  </RadioGroup>
                </FormControl>

                {/* Review Title */}
                <TextField
                  label="Review Title *"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  fullWidth
                  variant="outlined"
                  placeholder="Great for family listening"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      '&.Mui-focused': {
                        color: 'text.primary',
                        backgroundColor: 'background.paper',
                        px: 1,
                      },
                    },
                    '& .MuiInputBase-input': {
                      '&::placeholder': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                    },
                  }}
                />

                {/* Review Comment */}
                <TextField
                  label="Review Comment *"
                  value={formData.comment}
                  onChange={handleInputChange('comment')}
                  fullWidth
                  multiline
                  minRows={4}
                  maxRows={10}
                  variant="outlined"
                  placeholder="Detailed explanation of safety assessment"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      alignItems: 'flex-start',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      transform: 'translate(14px, 16px) scale(1)',
                      '&.MuiInputLabel-shrink': {
                        transform: 'translate(14px, -9px) scale(0.75)',
                      },
                      '&.Mui-focused': {
                        color: 'text.primary',
                        backgroundColor: 'background.paper',
                        px: 1,
                      },
                    },
                    '& .MuiInputBase-input': {
                      paddingTop: '16px',
                      paddingBottom: '16px',
                      lineHeight: 1.5,
                      '&::placeholder': {
                        opacity: 0.6,
                      },
                    },
                  }}
                />

                {/* Supporting Evidence */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Supporting Evidence *
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Provide specific examples that support your assessment. This helps build trust and credibility.
                  </Typography>
                  
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <TextField
                      label="Evidence item"
                      value={evidenceInput}
                      onChange={(e) => setEvidenceInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddEvidence();
                        }
                      }}
                      fullWidth
                      variant="outlined"
                      placeholder="Reviewed 50+ songs from discography"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          alignItems: 'center',
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                            borderWidth: '2px',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          transform: 'translate(14px, 16px) scale(1)',
                          '&.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -9px) scale(0.75)',
                          },
                          '&.Mui-focused': {
                            color: 'text.primary',
                            backgroundColor: 'background.paper',
                            px: 1,
                          },
                        },
                        '& .MuiInputBase-input': {
                          paddingTop: '16px',
                          paddingBottom: '16px',
                          '&::placeholder': {
                            opacity: 0.6,
                          },
                        },
                      }}
                    />
                    
                    <Button
                      onClick={handleAddEvidence}
                      variant="outlined"
                      startIcon={<AddIcon />}
                      sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        minWidth: 'auto',
                        px: 3,
                      }}
                    >
                      Add
                    </Button>
                  </Stack>

                  {formData.evidence.length > 0 && (
                    <List
                      sx={{
                        backgroundColor: 'background.paper',
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {formData.evidence.map((item, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              onClick={() => handleRemoveEvidence(item)}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        >
                          <ListItemIcon>
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: 'primary.main',
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    borderRadius: '12px',
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    textTransform: 'none',
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </Button>

                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}
                >
                  * Required fields. Please provide honest and evidence-based assessments.
                </Typography>
              </Stack>
            </form>
          )}
        </Paper>
      </Container>
    </Box>
  );
}