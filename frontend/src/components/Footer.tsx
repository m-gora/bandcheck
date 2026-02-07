import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Stack,
  Divider,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ShieldIcon from '@mui/icons-material/Shield';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4}>
          {/* Brand and Description */}
          <Stack direction="row" spacing={2} alignItems="center">
            <ShieldIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                BandCheck
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Community-driven music safety platform
              </Typography>
            </Box>
          </Stack>

          <Divider />

          {/* Links Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {/* Platform */}
            <Stack spacing={1}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Platform
              </Typography>
              <Link
                onClick={() => navigate('/')}
                color="text.secondary"
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                underline="none"
              >
                Home
              </Link>
              <Link
                onClick={() => navigate('/discover')}
                color="text.secondary"
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                underline="none"
              >
                Discover Bands
              </Link>
              <Link
                onClick={() => navigate('/safety-reports')}
                color="text.secondary"
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                underline="none"
              >
                Safety Reports
              </Link>
              <Link
                onClick={() => navigate('/about')}
                color="text.secondary"
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                underline="none"
              >
                About
              </Link>
            </Stack>

            {/* Legal */}
            <Stack spacing={1}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Legal
              </Typography>
              <Link
                onClick={() => navigate('/privacy')}
                color="text.secondary"
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                underline="none"
              >
                Privacy Policy
              </Link>
              <Link
                onClick={() => navigate('/terms')}
                color="text.secondary"
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                underline="none"
              >
                Terms of Service
              </Link>
              <Link
                onClick={() => navigate('/imprint')}
                color="text.secondary"
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                underline="none"
              >
                Imprint
              </Link>
            </Stack>

            {/* Community */}
            <Stack spacing={1}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Community
              </Typography>
              <Link
                onClick={() => navigate('/submit-artist')}
                color="text.secondary"
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                underline="none"
              >
                Submit Artist
              </Link>
            </Stack>

            {/* Connect */}
            <Stack spacing={1}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Connect
              </Typography>
              <Box>
                <IconButton
                  component="a"
                  href="https://github.com/m-gora/bandcheck"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                  aria-label="GitHub"
                >
                  <GitHubIcon />
                </IconButton>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Copyright and Legal Links */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
          >
            <Typography variant="body2" color="text.secondary">
              © {currentYear} BandCheck. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Link
                onClick={() => navigate('/privacy')}
                variant="body2"
                color="text.secondary"
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                underline="none"
              >
                Privacy
              </Link>
              <Link
                onClick={() => navigate('/terms')}
                variant="body2"
                color="text.secondary"
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                underline="none"
              >
                Terms
              </Link>
              <Link
                onClick={() => navigate('/imprint')}
                variant="body2"
                color="text.secondary"
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                underline="none"
              >
                Imprint
              </Link>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
