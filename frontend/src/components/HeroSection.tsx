import * as React from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  Container,
  Chip,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import SearchIcon from '@mui/icons-material/Search';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Stack
        spacing={4}
        sx={{
          textAlign: 'center',
          py: { xs: 8, sm: 12 },
          px: { xs: 2, sm: 4 },
        }}
      >
        <Box>
          <Chip
            label="Safe Music Discovery"
            icon={<ShieldIcon />}
            variant="outlined"
            sx={{
              mb: 2,
              borderColor: 'primary.main',
              color: 'primary.main',
              fontWeight: 'medium',
            }}
          />
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              fontWeight: 'bold',
              lineHeight: 1.2,
              mb: 2,
              background: 'linear-gradient(45deg, hsl(273, 91.6%, 58%), hsl(290, 85%, 65%))',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Discover Bands
            <br />
            Stay Safe
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
              mb: 4,
            }}
          >
            Find new music while staying informed about content that matters to you. 
            Share and discover community-driven reviews and safety information.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<SearchIcon />}
            onClick={() => navigate('/discover')}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: '12px',
              minWidth: { xs: '200px', sm: 'auto' },
            }}
          >
            Discover Bands
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<AssessmentIcon />}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: '12px',
              minWidth: { xs: '200px', sm: 'auto' },
            }}
          >
            View Safety Reports
          </Button>
        </Stack>

        <Box
          sx={{
            mt: 6,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
            flexWrap: 'wrap',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'success.main',
              }}
            />
            Community Reviews
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'success.main',
              }}
            />
            Safety First
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
}