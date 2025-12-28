# Azure Deployment Guide

## Prerequisites

1. **Install Azure CLI**
   ```bash
   brew install azure-cli
   ```

2. **Install Azure Developer CLI (azd)**
   ```bash
   brew install azure-dev
   ```

3. **Install Docker**
   ```bash
   brew install docker
   ```
   Start Docker Desktop after installation.

4. **Login to Azure**
   ```bash
   az login
   azd auth login
   ```

## Environment Setup

1. **Create environment file**
   ```bash
   cp .env.azure.example .env.azure
   ```

2. **Generate secrets**
   ```bash
   # Generate session secret
   openssl rand -base64 32
   ```

3. **Edit .env.azure** with your values:
   - `POSTGRES_ADMIN_PASSWORD`: Strong password for PostgreSQL
   - `SESSION_SECRET`: Generated secret from above
   - `REPLIT_CLIENT_ID` and `REPLIT_CLIENT_SECRET`: From Replit OAuth app

## Deployment

### Option 1: Deploy with Azure Developer CLI (Recommended)

```bash
# Load environment variables
export $(cat .env.azure | xargs)

# Initialize azd (first time only)
azd init

# Deploy everything
azd up
```

This will:
- Create resource group
- Deploy PostgreSQL Flexible Server
- Deploy Container Registry
- Build and push Docker image
- Deploy Container App
- Configure all secrets and environment variables

### Option 2: Manual Deployment

```bash
# Load environment variables
export $(cat .env.azure | xargs)

# Create resource group
az group create --name rg-${AZURE_ENV_NAME} --location ${AZURE_LOCATION}

# Deploy infrastructure
az deployment group create \
  --resource-group rg-${AZURE_ENV_NAME} \
  --template-file azure/infra/main.bicep \
  --parameters azure/infra/main.parameters.bicepparam

# Build and push Docker image
ACR_NAME=$(az acr list -g rg-${AZURE_ENV_NAME} --query "[0].name" -o tsv)
az acr build --registry $ACR_NAME --image hivecraft:latest .

# Update Container App with new image
CONTAINER_APP=$(az containerapp list -g rg-${AZURE_ENV_NAME} --query "[0].name" -o tsv)
az containerapp update \
  --name $CONTAINER_APP \
  --resource-group rg-${AZURE_ENV_NAME} \
  --image ${ACR_NAME}.azurecr.io/hivecraft:latest
```

## Database Migration

After first deployment, run migrations:

```bash
# Get PostgreSQL connection string
POSTGRES_HOST=$(az deployment group show \
  --resource-group rg-${AZURE_ENV_NAME} \
  --name main \
  --query properties.outputs.POSTGRES_HOST.value -o tsv)

# Set DATABASE_URL
export DATABASE_URL="postgresql://hivecraftadmin:${POSTGRES_ADMIN_PASSWORD}@${POSTGRES_HOST}:5432/hivecraft?sslmode=require"

# Run migrations
npm run db:push
```

## Verify Deployment

```bash
# Get Container App URL
CONTAINER_APP_URL=$(az deployment group show \
  --resource-group rg-${AZURE_ENV_NAME} \
  --name main \
  --query properties.outputs.AZURE_CONTAINER_APP_ENDPOINT.value -o tsv)

echo "Your app is running at: $CONTAINER_APP_URL"

# Test health endpoint
curl ${CONTAINER_APP_URL}/api/health
```

## Continuous Deployment

For automated deployments on git push, see `docs/CI-CD.md` (to be created).

## Troubleshooting

### View Container Logs
```bash
az containerapp logs show \
  --name $CONTAINER_APP \
  --resource-group rg-${AZURE_ENV_NAME} \
  --follow
```

### PostgreSQL Connection Issues
- Verify firewall rules in Azure Portal
- Check connection string format
- Ensure SSL mode is set to `require`

### Container Build Failures
- Verify Docker is running: `docker ps`
- Check build logs in Azure Portal
- Test local build: `docker build -t hivecraft .`

## Cost Optimization

Current configuration uses:
- Container App: Burstable, auto-scale 1-3 instances (~$30-50/month)
- PostgreSQL: Burstable B1ms (~$15/month)
- Container Registry: Basic (~$5/month)
- **Total: ~$50-70/month**

To reduce costs:
- Scale down Container App to 0 when not in use
- Use Dev/Test pricing for PostgreSQL
- Delete resources when not needed: `az group delete --name rg-${AZURE_ENV_NAME}`
