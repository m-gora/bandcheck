import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Divider,
} from '@mui/material';

export default function PrivacyPolicy() {
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
              Privacy Policy
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  1. Introduction
                </Typography>
                <Typography variant="body1" paragraph>
                  BandCheck ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  2. Information We Collect
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  2.1 Account Information
                </Typography>
                <Typography variant="body1" paragraph>
                  When you create an account through our authentication provider (Auth0), we collect:
                </Typography>
                <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                  <li>Email address</li>
                  <li>Display name</li>
                  <li>Profile picture (if provided)</li>
                  <li>Authentication credentials</li>
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  2.2 Content You Provide
                </Typography>
                <Typography variant="body1" paragraph>
                  When you use BandCheck, we collect:
                </Typography>
                <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                  <li>Band and artist submissions</li>
                  <li>Safety reviews and assessments</li>
                  <li>Comments and evidence you provide</li>
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  2.3 Automatically Collected Information
                </Typography>
                <Typography variant="body1" paragraph>
                  We may collect:
                </Typography>
                <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Device information</li>
                  <li>Usage patterns and interactions with the platform</li>
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  3. How We Use Your Information
                </Typography>
                <Typography variant="body1" paragraph>
                  We use your information to:
                </Typography>
                <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                  <li>Provide and maintain our service</li>
                  <li>Enable you to submit bands and reviews</li>
                  <li>Display your contributions to the community</li>
                  <li>Authenticate and secure your account</li>
                  <li>Prevent abuse and spam through Cloudflare Turnstile</li>
                  <li>Improve our platform and user experience</li>
                  <li>Communicate with you about service updates</li>
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  4. Data Sharing and Disclosure
                </Typography>
                <Typography variant="body1" paragraph>
                  We do not sell your personal information. We may share your information with:
                </Typography>
                <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                  <li><strong>Service Providers:</strong> Auth0 for authentication, Cloudflare for security</li>
                  <li><strong>Public Content:</strong> Reviews and submissions you make are public and visible to all users</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  5. Your Rights (GDPR)
                </Typography>
                <Typography variant="body1" paragraph>
                  Under GDPR, you have the right to:
                </Typography>
                <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                  <li>Access your personal data</li>
                  <li>Rectify inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                </Typography>
                <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                  To exercise these rights, please contact us at the email provided in our Imprint.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  6. Data Security
                </Typography>
                <Typography variant="body1" paragraph>
                  We implement appropriate technical and organizational measures to protect your personal data, including:
                </Typography>
                <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                  <li>Encrypted data transmission (HTTPS)</li>
                  <li>Secure authentication through Auth0</li>
                  <li>Bot protection via Cloudflare Turnstile</li>
                  <li>Regular security assessments</li>
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  7. Data Retention
                </Typography>
                <Typography variant="body1" paragraph>
                  We retain your personal data only as long as necessary to provide our services and fulfill the purposes outlined in this policy. You may request deletion of your account and associated data at any time.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  8. Cookies and Data Storage
                </Typography>
                <Typography variant="body1" paragraph>
                  We use <strong>strictly necessary cookies and local storage only</strong>, which are essential for the platform to function. 
                  No consent is required for these as they are technically necessary.
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Essential Cookies:
                </Typography>
                <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                  <li><strong>Auth0 Authentication:</strong> Session management, login state, and refresh tokens (stored in localStorage)</li>
                  <li><strong>Cloudflare Security:</strong> Bot protection and DDoS mitigation (e.g., __cf_bm cookie)</li>
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  What We DON'T Use:
                </Typography>
                <Typography component="ul" variant="body1" sx={{ pl: 4 }}>
                  <li>No analytics cookies (no Google Analytics, Matomo, etc.)</li>
                  <li>No marketing or advertising cookies</li>
                  <li>No social media tracking pixels</li>
                  <li>No user behavior profiling</li>
                  <li>No cross-site tracking</li>
                </Typography>
                <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                  You can clear authentication data at any time by logging out or clearing your browser's local storage.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  9. Children's Privacy
                </Typography>
                <Typography variant="body1" paragraph>
                  Our service is not intended for users under 16 years of age. We do not knowingly collect personal information from children under 16.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  10. Changes to This Policy
                </Typography>
                <Typography variant="body1" paragraph>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  11. Contact Us
                </Typography>
                <Typography variant="body1" paragraph>
                  If you have questions about this Privacy Policy, please contact us through the information provided in our Imprint page.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
