# Cloudflare Turnstile Setup Guide

This project uses Cloudflare Turnstile to protect the artist submission form from automated bots and spam.

## What is Cloudflare Turnstile?

Cloudflare Turnstile is a privacy-friendly CAPTCHA alternative that helps protect your forms from bots without frustrating your users. It's free and doesn't require users to solve puzzles or click on images.

## Setup Instructions

### 1. Get Your Turnstile Keys

1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile** in the sidebar
3. Click **Add Site** or **Add Widget**
4. Configure your widget:
   - **Domain**: Add your domain (e.g., `localhost` for development, `bandcheck.com` for production)
   - **Widget Mode**: Choose "Managed" (recommended) for automatic verification
5. Copy the **Site Key** and **Secret Key**

### 2. Configure Frontend

Add the Site Key to your frontend environment variables:

```bash
# frontend/.env
VITE_TURNSTILE_SITE_KEY=your-site-key-here
```

### 3. Configure Backend

Add the Secret Key to your backend environment variables:

```bash
# backend/.env
TURNSTILE_SECRET_KEY=your-secret-key-here
```

### 4. Testing Mode

For local development, you can use Cloudflare's test keys:

**Test Site Key (always passes):**
```
1x00000000000000000000AA
```

**Test Secret Key:**
```
1x0000000000000000000000000000000AA
```

These test keys will always return success and are useful for development without setting up a Cloudflare account.

## How It Works

### Frontend Flow

1. User fills out the artist submission form
2. Turnstile widget automatically verifies the user is human
3. On successful verification, a token is generated
4. The token is sent along with the form data to the backend

### Backend Verification

1. Backend receives the submission with the Turnstile token
2. Backend makes a server-to-server request to Cloudflare's verification API
3. Cloudflare validates the token
4. If valid, the submission proceeds; if invalid, it's rejected

## Security Benefits

- **Bot Protection**: Prevents automated submissions and spam
- **Privacy-Friendly**: Doesn't track users or require solving puzzles
- **Transparent**: Works seamlessly in the background
- **Free**: Cloudflare Turnstile is free to use
- **Rate Limiting**: Natural rate limiting through human verification

## Troubleshooting

### Widget Not Appearing

- Check that `VITE_TURNSTILE_SITE_KEY` is set in your frontend `.env` file
- Ensure you're running the development server with the environment variables loaded
- Verify the domain in Cloudflare dashboard matches your current domain

### Verification Failing

- Check that `TURNSTILE_SECRET_KEY` is set in your backend `.env` file
- Ensure the secret key matches the site key you're using
- Check network connectivity to Cloudflare's API
- Review backend logs for detailed error messages

### Development Tips

- Use test keys for local development to avoid rate limits
- Switch to production keys for staging and production environments
- Add both `localhost` and your production domain to Cloudflare

## API Reference

The Turnstile token is automatically included in the `createBand` request:

```typescript
const bandData = {
  name: "Band Name",
  description: "Band description",
  genres: ["Metal"],
  turnstileToken: "token-from-widget"
};
```

Backend verification happens automatically in the `createBand` controller.

## Resources

- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [React Turnstile Package](https://github.com/marsidev/react-turnstile)
