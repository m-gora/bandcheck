import * as React from 'react';
import {
  Box,
  Container,
  Stack,
  Typography,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const features = [
  {
    icon: <SearchIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Find Bands',
    description: 'Discover new artists and bands through our comprehensive database. Search by genre, location, or popularity to find music that matches your taste.',
    highlights: ['Comprehensive database', 'Advanced filters', 'Personalized recommendations']
  },
  {
    icon: <PsychologyIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
    title: 'AI Content Analysis',
    description: 'Our advanced AI analyzes lyrics, social media posts, and band content to identify potentially harmful or triggering material automatically.',
    highlights: ['Real-time analysis', 'Multiple content sources', 'Accuracy-focused algorithms']
  },
  {
    icon: <AssessmentIcon sx={{ fontSize: 40, color: 'success.main' }} />,
    title: 'Safety Scoring',
    description: 'Get clear safety scores based on community reviews and AI analysis. Make informed decisions about the content you consume.',
    highlights: ['Transparent scoring', 'Community-driven', 'Regular updates']
  }
];

const benefits = [
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
    title: 'Safe Discovery',
    description: 'Explore new music with confidence'
  },
  {
    icon: <GroupIcon sx={{ fontSize: 32, color: 'secondary.main' }} />,
    title: 'Community Driven',
    description: 'Reviews by real music fans'
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 32, color: 'success.main' }} />,
    title: 'Always Updated',
    description: 'Fresh content analysis daily'
  }
];

export default function FeaturesSection() {
  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 8, sm: 12 } }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Stack spacing={2} sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 'bold',
              color: 'text.primary',
            }}
          >
            How It Works
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Three simple steps to discover music safely and make informed choices about the content you consume
          </Typography>
        </Stack>

        {/* Main Features */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 4,
            mb: 10,
            alignItems: 'stretch',
          }}
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[8],
                },
              }}
            >
              <CardContent sx={{ 
                p: 4, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <Stack spacing={3} sx={{ height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: 'text.primary',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      textAlign: 'center',
                      lineHeight: 1.6,
                      flex: 1,
                    }}
                  >
                    {feature.description}
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 'auto' }}>
                    {feature.highlights.map((highlight, idx) => (
                      <Typography
                        key={idx}
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontSize: '0.9rem',
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            flexShrink: 0,
                          }}
                        />
                        {highlight}
                      </Typography>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Benefits Section */}
        <Paper
          elevation={1}
          sx={{
            borderRadius: 3,
            p: { xs: 4, sm: 6 },
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, hsl(273, 91.6%, 58%, 0.05), hsl(290, 85%, 65%, 0.05))'
                : 'linear-gradient(135deg, hsl(273, 91.6%, 58%, 0.1), hsl(290, 85%, 65%, 0.1))',
          }}
        >
          <Typography
            variant="h4"
            component="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              mb: 4,
              color: 'text.primary',
            }}
          >
            Why Choose BandCheck?
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, 1fr)',
              },
              gap: 4,
              justifyItems: 'center',
            }}
          >
            {benefits.map((benefit, index) => (
              <Stack
                key={index}
                spacing={2}
                sx={{
                  textAlign: 'center',
                  alignItems: 'center',
                }}
              >
                {benefit.icon}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: 'text.primary',
                  }}
                >
                  {benefit.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {benefit.description}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}