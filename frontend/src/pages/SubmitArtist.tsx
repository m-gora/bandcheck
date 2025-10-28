import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  TextField,
  Button,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Autocomplete,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../context/AuthContext';

// Genre options for the form
const genreOptions = [
  'Alternative Rock',
  'Blues Rock',
  'Country',
  'Electronic',
  'Electropop',
  'Folk',
  'Garage Rock',
  'Hard Rock',
  'Hip Hop',
  'Indie Pop',
  'Indie Rock',
  'Jazz',
  'Metal',
  'Neo-Psychedelia',
  'Pop',
  'Post-Punk Revival',
  'Psychedelic Pop',
  'Punk',
  'R&B',
  'Rock',
  'Synth-pop',
];

interface ArtistFormData {
  name: string;
  location: string;
  formed: string;
  genres: string[];
  description: string;
  members: string[];
  website: string;
  imageUrl: string;
}

export default function SubmitArtist() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = React.useState<ArtistFormData>({
    name: '',
    location: '',
    formed: '',
    genres: [],
    description: '',
    members: [],
    website: '',
    imageUrl: '',
  });
  
  const [memberInput, setMemberInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (field: keyof ArtistFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleGenresChange = (newGenres: string[]) => {
    setFormData(prev => ({
      ...prev,
      genres: newGenres,
    }));
  };

  const handleAddMember = () => {
    if (memberInput.trim() && !formData.members.includes(memberInput.trim())) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, memberInput.trim()],
      }));
      setMemberInput('');
    }
  };

  const handleRemoveMember = (memberToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(member => member !== memberToRemove),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Artist name is required');
      return;
    }
    
    if (formData.genres.length === 0) {
      setError('Please select at least one genre');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Artist description is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real app, this would be an API call
      console.log('Submitting artist:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        navigate('/discover');
      }, 2000);
      
    } catch (err) {
      setError('Failed to submit artist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <Box sx={{ py: { xs: 8, sm: 12 }, backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="md">
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

        {/* Header */}
        <Stack spacing={2} sx={{ mb: 4, textAlign: 'center', alignItems: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            Submit New Artist
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              textAlign: 'center',
            }}
          >
            Help grow our database by submitting artists for safety review. 
            All submissions will be reviewed by our community before being published.
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
                Artist Submitted Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Thank you for your submission. The artist will be reviewed by our community.
                Redirecting to discover page...
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

                {/* Artist Name */}
                <TextField
                  label="Artist Name *"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  fullWidth
                  variant="outlined"
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
                    },
                  }}
                />

                {/* Location and Year Formed */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Location"
                    value={formData.location}
                    onChange={handleInputChange('location')}
                    fullWidth
                    variant="outlined"
                    placeholder="Sheffield, UK"
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
                  
                  <TextField
                    label="Year Formed"
                    value={formData.formed}
                    onChange={handleInputChange('formed')}
                    fullWidth
                    variant="outlined"
                    placeholder="2002"
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
                </Stack>

                {/* Genres */}
                <Autocomplete
                  multiple
                  options={genreOptions}
                  value={formData.genres}
                  onChange={(_, newValue) => handleGenresChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Genres *"
                      placeholder="Select genres..."
                      variant="outlined"
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
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option}
                        label={option}
                        size="small"
                        sx={{
                          borderRadius: '8px',
                          backgroundColor: 'primary.100',
                          color: 'primary.700',
                        }}
                      />
                    ))
                  }
                />

                {/* Band Members */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Band Members
                  </Typography>
                  
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <TextField
                      label="Member name"
                      value={memberInput}
                      onChange={(e) => setMemberInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddMember();
                        }
                      }}
                      fullWidth
                      variant="outlined"
                      placeholder="Enter band member name"
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
                      onClick={handleAddMember}
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

                  {formData.members.length > 0 && (
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {formData.members.map((member) => (
                        <Chip
                          key={member}
                          label={member}
                          onDelete={() => handleRemoveMember(member)}
                          sx={{
                            borderRadius: '8px',
                            backgroundColor: 'secondary.100',
                            color: 'secondary.700',
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>

                {/* Description */}
                <TextField
                  label="Artist Description *"
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  fullWidth
                  multiline
                  minRows={4}
                  maxRows={8}
                  variant="outlined"
                  placeholder="Tell us about the artist's background, style, and achievements"
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

                {/* Website and Image URL */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Official Website"
                    value={formData.website}
                    onChange={handleInputChange('website')}
                    fullWidth
                    variant="outlined"
                    placeholder="https://artist-website.com"
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
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        },
                      },
                    }}
                  />
                  
                  <TextField
                    label="Artist Image URL"
                    value={formData.imageUrl}
                    onChange={handleInputChange('imageUrl')}
                    fullWidth
                    variant="outlined"
                    placeholder="https://image-url.com/photo.jpg"
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
                </Stack>

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
                  {loading ? 'Submitting...' : 'Submit Artist for Review'}
                </Button>

                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}
                >
                  * Required fields. All submissions are reviewed before publication.
                </Typography>
              </Stack>
            </form>
          )}
        </Paper>
      </Container>
    </Box>
  );
}