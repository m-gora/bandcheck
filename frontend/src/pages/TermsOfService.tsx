import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Divider,
  Link,
} from '@mui/material';

export default function TermsOfService() {
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
              Terms of Service
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  1. Acceptance of Terms
                </Typography>
                <Typography variant="body1" paragraph>
                  By accessing and using BandCheck, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  2. Description of Service
                </Typography>
                <Typography variant="body1" paragraph>
                  BandCheck is a community-driven platform that allows users to:
                </Typography>
                <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                  <li>Discover and search for music artists and bands</li>
                  <li>Submit new artists for community review</li>
                  <li>Provide safety assessments and reviews of bands</li>
                  <li>Access community-driven safety ratings</li>
                </Typography>
                <Typography variant="body1" paragraph>
                  The service is provided on a <strong>non-profit basis</strong> for informational and community purposes only. This platform is maintained and funded by its operator without commercial intent, as a service to the music community.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  3. User Accounts
                </Typography>
                <Typography variant="body1" paragraph>
                  To access certain features, you must create an account. You agree to:
                </Typography>
                <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Be responsible for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  4. User Conduct
                </Typography>
                <Typography variant="body1" paragraph>
                  You agree NOT to:
                </Typography>
                <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                  <li>Submit false, misleading, or defamatory content</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Attempt to circumvent security measures</li>
                  <li>Use automated tools to submit content or scrape data</li>
                  <li>Impersonate others or misrepresent your affiliation</li>
                  <li>Post spam, advertisements, or promotional content</li>
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  5. Content and Reviews
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  5.1 User-Generated Content
                </Typography>
                <Typography variant="body1" paragraph>
                  By submitting content (reviews, band submissions, comments), you:
                </Typography>
                <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                  <li>Grant us a worldwide, non-exclusive license to use, display, and distribute your content</li>
                  <li>Confirm that you have the right to submit the content</li>
                  <li>Understand that your content will be publicly visible</li>
                  <li>Retain ownership of your content</li>
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  5.2 Content Standards
                </Typography>
                <Typography variant="body1" paragraph>
                  All reviews and submissions must:
                </Typography>
                <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                  <li>Be based on genuine experience or knowledge</li>
                  <li>Provide constructive and factual information</li>
                  <li>Not contain hate speech, threats, or illegal content</li>
                  <li>Not violate the privacy or rights of others</li>
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  5.3 Community Opinion
                </Typography>
                <Typography variant="body1" paragraph>
                  Safety assessments and reviews represent individual user opinions and do not necessarily reflect the views of BandCheck. We do not endorse or verify the accuracy of user-submitted content.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  6. Intellectual Property & Open Source
                </Typography>
                <Typography variant="body1" paragraph>
                  BandCheck is operated as a non-profit, community service and is <strong>open source software</strong> released under the <strong>MIT License</strong>.
                </Typography>
                <Typography variant="body1" paragraph>
                  The complete source code is available at: <Link href="https://github.com/m-gora/bandcheck" target="_blank" rel="noopener noreferrer" sx={{ color: 'primary.main' }}>github.com/m-gora/bandcheck</Link>
                </Typography>
                <Typography variant="body1" paragraph>
                  Under the MIT License, you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to the conditions in the license. This means anyone can contribute to, fork, or extend the platform.
                </Typography>
                <Typography variant="body1" paragraph>
                  User-generated content (reviews, band submissions) remains the property of the users who created it, and the community benefits from these contributions.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  7. Disclaimer of Warranties
                </Typography>
                <Typography variant="body1" paragraph>
                  BandCheck is provided "AS IS" without warranties of any kind. We do not guarantee:
                </Typography>
                <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                  <li>The accuracy or completeness of content</li>
                  <li>Uninterrupted or error-free service</li>
                  <li>That the service will meet your requirements</li>
                  <li>The reliability of user-submitted reviews</li>
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  8. Limitation of Liability
                </Typography>
                <Typography variant="body1" paragraph>
                  To the maximum extent permitted by law, BandCheck and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  9. Content Moderation
                </Typography>
                <Typography variant="body1" paragraph>
                  We reserve the right to:
                </Typography>
                <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                  <li>Review, edit, or remove any content</li>
                  <li>Suspend or terminate accounts that violate these terms</li>
                  <li>Refuse service to anyone at any time</li>
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  10. Termination
                </Typography>
                <Typography variant="body1" paragraph>
                  You may terminate your account at any time. We may terminate or suspend your access immediately, without prior notice, for any breach of these Terms.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  11. Changes to Terms
                </Typography>
                <Typography variant="body1" paragraph>
                  We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  12. Governing Law
                </Typography>
                <Typography variant="body1" paragraph>
                  These Terms shall be governed by and construed in accordance with the laws of the European Union and applicable national laws, without regard to conflict of law provisions.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  13. Contact Information
                </Typography>
                <Typography variant="body1" paragraph>
                  For questions about these Terms, please contact us through the information provided in our Imprint page.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
