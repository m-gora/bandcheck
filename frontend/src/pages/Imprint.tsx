import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Divider,
  Alert,
  Link,
} from '@mui/material';

export default function Imprint() {
  return (
    <Box sx={{ py: { xs: 10, sm: 14 }, backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Stack spacing={4}>
          <Box>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, hsl(273, 91.6%, 58%), hsl(290, 85%, 65%))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Imprint / Impressum
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Legal information according to § 5 TMG (Germany) and Art. 5 E-Commerce Directive
            </Typography>
          </Box>

          <Alert severity="info">
            <Typography variant="body2">
              Please update this page with your actual contact information, business details, and legal requirements for your jurisdiction.
            </Typography>
          </Alert>

          <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Service Provider
                </Typography>
                <Typography variant="body1">
                  BandCheck
                </Typography>
                <Typography variant="body1" paragraph>
                  Non-profit community platform
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Contact Information
                </Typography>
                <Typography variant="body1" component="div">
                  <strong>Operator:</strong> [Your Name or Organization Name]
                  <br />
                  <strong>Address:</strong> [Your Street Address]
                  <br />
                  [Your Postal Code, City]
                  <br />
                  [Your Country]
                  <br />
                  <br />
                  <strong>Email:</strong> [your-email@example.com]
                  <br />
                  <strong>Phone:</strong> [Your Phone Number] (optional)
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Responsible for Content
                </Typography>
                <Typography variant="body1" paragraph>
                  According to § 55 Abs. 2 RStV (Germany):
                </Typography>
                <Typography variant="body1">
                  [Name of Person Responsible]
                  <br />
                  [Address]
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  EU Dispute Resolution
                </Typography>
                <Typography variant="body1" paragraph>
                  The European Commission provides a platform for online dispute resolution (ODR): 
                  https://ec.europa.eu/consumers/odr/
                </Typography>
                <Typography variant="body1" paragraph>
                  Our email address can be found in the contact information above.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Consumer Dispute Resolution
                </Typography>
                <Typography variant="body1" paragraph>
                  We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Liability for Content
                </Typography>
                <Typography variant="body1" paragraph>
                  As a service provider, we are responsible for our own content on these pages in accordance with general legislation. However, we are not obligated to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.
                </Typography>
                <Typography variant="body1" paragraph>
                  User-generated content (reviews, band submissions) represents the opinions of individual users and does not necessarily reflect the views of BandCheck.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Liability for Links
                </Typography>
                <Typography variant="body1" paragraph>
                  Our website contains links to external websites over whose content we have no control. Therefore, we cannot accept any liability for this external content. The respective provider or operator of the pages is always responsible for the content of the linked pages.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Copyright & Open Source License
                </Typography>
                <Typography variant="body1" paragraph>
                  BandCheck is <strong>open source software</strong> released under the <strong>MIT License</strong>.
                </Typography>
                <Typography variant="body1" paragraph>
                  Source Code: <Link href="https://github.com/m-gora/bandcheck" target="_blank" rel="noopener noreferrer" sx={{ color: 'primary.main' }}>github.com/m-gora/bandcheck</Link>
                </Typography>
                <Typography variant="body1" paragraph>
                  The platform is provided free of charge as a non-profit community service. Anyone is welcome to contribute, fork, or extend the platform under the terms of the MIT License.
                </Typography>
                <Typography variant="body1" paragraph>
                  User-generated content (reviews, band submissions, comments) remains the property of the respective users. By submitting content, users grant BandCheck a non-exclusive license to display and distribute this content on the platform for the benefit of the community.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Data Protection
                </Typography>
                <Typography variant="body1" paragraph>
                  Information about the handling of your personal data can be found in our Privacy Policy.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Third-Party Services
                </Typography>
                <Typography variant="body1" paragraph>
                  This platform uses the following third-party services:
                </Typography>
                <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                  <li><strong>Auth0</strong> - For user authentication and account management</li>
                  <li><strong>Cloudflare Turnstile</strong> - For spam and bot protection</li>
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Alert severity="warning">
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Important Notice
            </Typography>
            <Typography variant="body2">
              This is a template imprint. You must customize it with your actual information to comply with EU and German law. 
              Depending on your jurisdiction, you may need to include additional information such as VAT number, commercial register entries, 
              professional associations, and more. Please consult with a legal professional to ensure full compliance.
            </Typography>
          </Alert>
        </Stack>
      </Container>
    </Box>
  );
}
