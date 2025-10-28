# Deployment Setup Guide

This guide walks through setting up the CI/CD pipeline for BandCheck on Azure.

## Prerequisites

1. **Azure Account** with appropriate permissions
2. **Azure CLI** installed locally
3. **GitHub Repository** with appropriate secrets configured
4. **Terraform** for infrastructure management

## Azure Resources Setup

### 1. Create Service Principal for GitHub Actions

```bash
# Create a service principal for GitHub Actions
az ad sp create-for-rbac --name "bandcheck-github-actions" --role contributor --scopes /subscriptions/{subscription-id} --sdk-auth
```

Store the output JSON as `AZURE_CREDENTIALS` in GitHub Secrets.

### 2. Create Azure Static Web App

```bash
# Create resource group (if not exists)
az group create --name bandcheck-rg --location "West Europe"

# Create Static Web App
az staticwebapp create \
  --name bandcheck-frontend \
  --resource-group bandcheck-rg \
  --source https://github.com/{your-username}/bandcheck \
  --location "West Europe" \
  --branch main \
  --app-location "./frontend" \
  --output-location "dist"
```

Get the deployment token:
```bash
az staticwebapp secrets list --name bandcheck-frontend --query "properties.apiKey"
```

Store this as `AZURE_STATIC_WEB_APPS_API_TOKEN` in GitHub Secrets.

### 3. Create Azure Functions App

```bash
# Create storage account for Functions
az storage account create \
  --name bandcheckfunctions \
  --location "West Europe" \
  --resource-group bandcheck-rg \
  --sku Standard_LRS

# Create Function App
az functionapp create \
  --resource-group bandcheck-rg \
  --consumption-plan-location "West Europe" \
  --runtime node \
  --runtime-version 22 \
  --functions-version 4 \
  --name bandcheck-api \
  --storage-account bandcheckfunctions \
  --os-type Linux
```

## GitHub Secrets Configuration

Configure the following secrets in your GitHub repository:

### Required for All Environments
- `AZURE_CREDENTIALS` - Service principal JSON for Azure authentication
- `GITHUB_TOKEN` - Automatically provided by GitHub

### Development/Staging Environment
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - Static Web App deployment token
- `AZURE_FUNCTIONAPP_NAME` - Name of your Azure Functions app (e.g., "bandcheck-api")
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_AUTH0_DOMAIN` - Auth0 domain for authentication
- `VITE_AUTH0_CLIENT_ID` - Auth0 client ID

### Production Environment (Additional)
- `AZURE_STATIC_WEB_APPS_API_TOKEN_PROD` - Production Static Web App token
- `AZURE_FUNCTIONAPP_NAME_PROD` - Production Functions app name
- `VITE_API_BASE_URL_PROD` - Production API URL
- `VITE_AUTH0_DOMAIN_PROD` - Production Auth0 domain
- `VITE_AUTH0_CLIENT_ID_PROD` - Production Auth0 client ID

### Staging Environment (Optional)
- `AZURE_CREDENTIALS_STAGING` - Staging environment service principal
- `AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING` - Staging Static Web App token
- `AZURE_FUNCTIONAPP_NAME_STAGING` - Staging Functions app name
- `VITE_API_BASE_URL_STAGING` - Staging API URL
- `VITE_AUTH0_DOMAIN_STAGING` - Staging Auth0 domain
- `VITE_AUTH0_CLIENT_ID_STAGING` - Staging Auth0 client ID

## Workflow Triggers

### CI Workflow (`ci.yml`)
- **Triggers**: Push to `main` or `dev` branches, PRs to `main` or `dev`
- **Purpose**: Linting, type checking, building, and testing
- **Runs**: On every push and PR

### Development Deployment (`deploy.yml`)
- **Triggers**: Push to `main` or `dev` branches, PRs
- **Purpose**: Deploy to development/staging environments
- **Infrastructure**: Deploys with Terraform
- **Backend**: Deploys to Azure Functions
- **Frontend**: Deploys to Azure Static Web Apps with PR previews

### Production Deployment (`production.yml`)
- **Triggers**: GitHub releases, manual workflow dispatch
- **Purpose**: Deploy to production environment
- **Requires**: Manual approval for production environment
- **Infrastructure**: Full Terraform deployment
- **Validation**: All CI checks must pass

## Environment Configuration

### Development
- Automatically deploys on push to `dev` branch
- Uses development Azure resources
- Includes PR preview deployments

### Production
- Triggered by GitHub releases or manual dispatch
- Requires environment protection rules
- Uses production Azure resources
- Full infrastructure deployment

## Terraform Backend

Ensure your Terraform backend is configured in `infrastructure/main.tf`:

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "bandcheck-terraform-rg"
    storage_account_name = "bandcheckterraformstate"
    container_name       = "tfstate"
    key                  = "bandcheck.terraform.tfstate"
  }
}
```

Create the storage account for Terraform state:

```bash
# Create resource group for Terraform state
az group create --name bandcheck-terraform-rg --location "West Europe"

# Create storage account
az storage account create \
  --resource-group bandcheck-terraform-rg \
  --name bandcheckterraformstate \
  --sku Standard_LRS \
  --encryption-services blob

# Create container
az storage container create \
  --name tfstate \
  --account-name bandcheckterraformstate
```

## Monitoring and Troubleshooting

### View Deployment Logs
1. Go to GitHub Actions tab in your repository
2. Select the workflow run
3. Click on individual jobs to see detailed logs

### Azure Function Logs
```bash
# Stream logs from Azure Functions
az webapp log tail --name bandcheck-api --resource-group bandcheck-rg
```

### Static Web App Logs
- Available in Azure Portal under your Static Web App resource
- GitHub Actions tab shows deployment status

## Security Considerations

1. **Secrets Management**: Never commit secrets to the repository
2. **Least Privilege**: Service principals should have minimal required permissions
3. **Environment Protection**: Use GitHub environment protection rules for production
4. **Resource Access**: Configure CORS and authentication properly
5. **HTTPS Only**: Ensure all resources use HTTPS in production

## Rollback Strategy

### Frontend Rollback
- Azure Static Web Apps maintains deployment history
- Use Azure CLI or portal to rollback to previous deployment

### Backend Rollback
- Deploy previous version using GitHub Actions workflow dispatch
- Or use Azure CLI to deploy specific version

### Infrastructure Rollback
- Terraform state allows infrastructure rollback
- Use `terraform plan` with previous configuration
- Apply carefully with `terraform apply`