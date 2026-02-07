# Azure Static Web Apps Configuration

This document explains how to configure environment variables in Azure Static Web Apps for the BandCheck application.

## Application Settings Configuration

In Azure Static Web Apps, you can configure application settings through the Azure Portal or Azure CLI. These settings will be available as environment variables at runtime.

### Required Application Settings

Configure the following application settings in your Azure Static Web App:

```bash
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_REDIRECT_URI=https://your-static-web-app.azurestaticapps.net
VITE_API_BASE_URL=https://bandcheck-backend.azurewebsites.net/api
```

### Configuration via Azure Portal

1. Go to the [Azure Portal](https://portal.azure.com)
2. Navigate to your Static Web App resource
3. In the left menu, click on **"Configuration"**
4. Click **"+ Add"** to add a new application setting
5. Add each environment variable with its name and value
6. Click **"Save"** to apply the changes

### Configuration via Azure CLI

```bash
# Set application settings for your Static Web App
az staticwebapp appsettings set \
  --name "bandcheck-frontend" \
  --resource-group "bandcheck-rg" \
  --setting-names \
    VITE_AUTH0_DOMAIN="your-domain.auth0.com" \
    VITE_AUTH0_CLIENT_ID="your-auth0-client-id" \
    VITE_AUTH0_REDIRECT_URI="https://your-static-web-app.azurestaticapps.net" \
    VITE_API_BASE_URL="https://bandcheck-backend.azurewebsites.net/api"
```

### Verification

After deployment, you can verify the configuration is working by:

1. Opening your deployed app in a browser
2. Opening browser developer tools
3. Checking the Console for any configuration errors
4. Verifying API calls are going to the correct backend URL

### Development vs Production

- **Development**: Uses `.env` file with `VITE_` prefixed variables
- **Production**: Uses Azure Static Web App application settings

The application automatically detects the environment and uses the appropriate configuration source.

### Security Notes

- Never commit actual Auth0 credentials to your repository
- Use different Auth0 applications for development and production
- Regularly rotate your Auth0 client secrets
- Ensure your Auth0 callback URLs match your deployed domains

### Troubleshooting

If environment variables are not working:

1. Verify the variable names have the `VITE_` prefix
2. Check that application settings are saved in Azure Portal
3. Try redeploying the Static Web App
4. Check browser console for configuration errors
5. Verify Auth0 application settings match the environment