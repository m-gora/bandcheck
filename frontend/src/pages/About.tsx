import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Shield,
  Search,
  People,
  Security,
  Groups,
  Verified,
  TrendingUp,
} from '@mui/icons-material';

const About: React.FC = () => {
  const features = [
    {
      icon: <Shield />,
      title: 'Content Warnings',
      description: 'Evidence-based content warnings help you avoid music with themes that might be triggering or harmful.'
    },
    {
      icon: <Search />,
      title: 'Safe Discovery',
      description: 'Find bands and music with comprehensive filtering based on content types and warning categories.'
    },
    {
      icon: <People />,
      title: 'Community Driven',
      description: 'Users contribute factual information about lyrical content, themes, and potentially triggering material.'
    },
    {
      icon: <Verified />,
      title: 'Evidence Based',
      description: 'All content warnings focus on objective, factual information rather than subjective opinions.'
    }
  ];

  const stats = [
    { number: 'Open Source', label: 'Development Model' },
    { number: 'Non-Profit', label: 'Platform Mission' },
    { number: 'Community', label: 'Driven Content' },
    { number: 'Evidence', label: 'Based Warnings' }
  ];

  const _team = [
    {
      name: 'Marco',
      role: 'Creator & Developer',
      description: 'Passionate about creating safer spaces for music discovery and making content warnings accessible to everyone.'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 12, sm: 14 }, pb: 8 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          About BandCheck
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
          Making discovering music safer through community-driven content warnings and evidence-based information.
        </Typography>
        <Chip
          icon={<Shield />}
          label="Open Source • Non-Profit • Community Driven"
          variant="outlined"
          sx={{ fontSize: '1.1rem', py: 3, px: 2 }}
        />
      </Box>

      {/* Mission Statement */}
      <Paper elevation={2} sx={{ p: 6, mb: 8, bgcolor: 'primary.50', borderRadius: 3 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" color="primary.main">
          Our Mission
        </Typography>
        <Typography variant="h6" textAlign="center" sx={{ lineHeight: 1.7, color: 'text.secondary', mb: 3 }}>
          Bandcheck's mission is to make discovering music safer. Our service delivers tools where the 
          community contributes to safer listening experiences by building a shared knowledge base of content warnings.
        </Typography>
        <Typography variant="body1" textAlign="center" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
          Reviews are evidence-based and focus on content warnings rather than subjective ratings. 
          This empowers users to make informed decisions about the music they choose to listen to. 
          The whole platform is non-profit and open source because we believe access to information 
          about potentially triggering content should be freely available to everyone.
        </Typography>
      </Paper>

      {/* Features */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
          What We Do
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4 }}>
          {features.map((feature, index) => (
            <Card key={index} sx={{ height: '100%', p: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
                    {feature.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Core Principles */}
      <Paper elevation={1} sx={{ p: 6, mb: 8, bgcolor: 'background.default', borderRadius: 3 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
          Core Principles
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 4 }}>
          {stats.map((stat, index) => (
            <Box key={index} textAlign="center">
              <Typography variant="h5" component="div" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stat.number}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* How It Works */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
          How It Works
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          <Box textAlign="center">
            <Avatar sx={{ bgcolor: 'secondary.main', width: 80, height: 80, mx: 'auto', mb: 3 }}>
              <Typography variant="h4" color="white">1</Typography>
            </Avatar>
            <Typography variant="h6" gutterBottom>
              Discover Bands
            </Typography>
            <Typography color="text.secondary">
              Search our database of bands with comprehensive content warning filters to find music that's right for you.
            </Typography>
          </Box>
          <Box textAlign="center">
            <Avatar sx={{ bgcolor: 'secondary.main', width: 80, height: 80, mx: 'auto', mb: 3 }}>
              <Typography variant="h4" color="white">2</Typography>
            </Avatar>
            <Typography variant="h6" gutterBottom>
              Read Content Warnings
            </Typography>
            <Typography color="text.secondary">
              Access evidence-based information about lyrical themes, content types, and potential triggers.
            </Typography>
          </Box>
          <Box textAlign="center">
            <Avatar sx={{ bgcolor: 'secondary.main', width: 80, height: 80, mx: 'auto', mb: 3 }}>
              <Typography variant="h4" color="white">3</Typography>
            </Avatar>
            <Typography variant="h6" gutterBottom>
              Contribute Information
            </Typography>
            <Typography color="text.secondary">
              Help the community by adding factual content warnings and information about bands and their music.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Creator Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
          Creator & Community
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <Card sx={{ textAlign: 'center', p: 4, maxWidth: 400 }}>
            <CardContent>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  mx: 'auto', 
                  mb: 3,
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                M
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Marco
              </Typography>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Creator & Developer
              </Typography>
              <Typography color="text.secondary">
                Passionate about creating safer spaces for music discovery and making content warnings accessible to everyone.
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box textAlign="center">
          <Typography variant="h6" gutterBottom>
            Open Source Future
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            BandCheck is designed to be community-driven and open source. As the project grows, 
            we welcome contributors who share our mission of making music discovery safer through 
            transparent, evidence-based content warnings.
          </Typography>
        </Box>
      </Box>

      {/* Values */}
      <Paper elevation={2} sx={{ p: 6, mb: 8, bgcolor: 'background.paper', borderRadius: 3 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
          Our Values
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          <Stack alignItems="center" textAlign="center">
            <Security sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Informed Choice
            </Typography>
            <Typography color="text.secondary">
              Everyone deserves access to information that helps them make informed decisions about their music consumption.
            </Typography>
          </Stack>
          <Stack alignItems="center" textAlign="center">
            <Groups sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Evidence Based
            </Typography>
            <Typography color="text.secondary">
              All content warnings focus on factual information rather than subjective opinions or ratings.
            </Typography>
          </Stack>
          <Stack alignItems="center" textAlign="center">
            <TrendingUp sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Open Access
            </Typography>
            <Typography color="text.secondary">
              Information about potentially triggering content should be freely available to everyone, without barriers.
            </Typography>
          </Stack>
        </Box>
      </Paper>

      {/* Call to Action */}
      <Box sx={{ textAlign: 'center', p: 6, bgcolor: 'primary.main', color: 'white', borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom>
          Help Make Music Discovery Safer
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
          Contribute factual content warnings and help build a comprehensive database of music information.
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.8 }}>
          Together, we can make music discovery safer for everyone through transparent, evidence-based information sharing.
        </Typography>
      </Box>
    </Container>
  );
};

export default About;