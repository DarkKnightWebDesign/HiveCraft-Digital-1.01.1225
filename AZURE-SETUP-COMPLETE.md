# Azure Deployment - Complete Setup

## ✅ What's Been Created

### Infrastructure as Code (Bicep)
All Azure resources are defined in `/azure/infra/`:

1. **main.bicep** - Main deployment template
   - Creates resource group with `azd-env-name` tag
   - Deploys all resources via resources.bicep module
   - Outputs: Registry endpoint, Container App URL, PostgreSQL host

2. **resources.bicep** - All Azure resources
   - ✅ User-Assigned Managed Identity (required for AZD)
   - ✅ Log Analytics Workspace (for Container App logs)
   - ✅ Azure Container Registry (for Docker images)
   - ✅ AcrPull role assignment (allows Container App to pull images)
   - ✅ Container App Environment (with Log Analytics)
   - ✅ PostgreSQL Flexible Server 16 (Burstable B1ms)
   - ✅ PostgreSQL Database (hivecraft)
   - ✅ Firewall Rules (Azure services + development access)
   - ✅ Storage Account (for file uploads)
   - ✅ Container App with:
     - Managed identity authentication
     - Auto-scaling (1-3 replicas)
     - CORS enabled
     - Secrets for DB, session, Replit OAuth
     - Environment variables configured

3. **main.parameters.bicepparam** - Parameter file
   - Reads from environment variables
   - Uses Azure Developer CLI conventions

4. **azure.yaml** - AZD configuration
   - Defines "web" service
   - Sets up Container App hosting

### Application Packaging

1. **Dockerfile** - Multi-stage build
   - Stage 1: Builds React app + Express server
   - Stage 2: Production image with built output
   - Optimized for fast cold starts

2. **.dockerignore** - Excludes unnecessary files
   - node_modules, .git, docs, etc.

### Configuration

1. **.env.azure.example** - Template for deployment secrets
   - PostgreSQL admin password
   - Session secret
   - Replit OAuth credentials

2. **docs/AZURE-DEPLOYMENT.md** - Step-by-step deployment guide

## 📋 Deployment Rules Applied

All mandatory Azure Developer CLI (AZD) + Bicep rules have been implemented:

✅ **AZD Rules:**
- User-Assigned Managed Identity exists
- Resource Group has `azd-env-name` tag
- Parameters: `environmentName`, `location`, `resourceGroupName`
- Container App has `azd-service-name: web` tag
- Output: `RESOURCE_GROUP_ID`
- Output: `AZURE_CONTAINER_REGISTRY_ENDPOINT`

✅ **Bicep Rules:**
- Files: main.bicep, main.parameters.bicepparam ✓
- Resource naming: `az{prefix}{uniqueString}` ✓
- Max 32 characters, alphanumeric only ✓

✅ **Container App Rules:**
- User-Assigned Managed Identity attached ✓
- AcrPull role assignment created BEFORE Container App ✓
- Uses managed identity (not system) for registry ✓
- Base image: `mcr.microsoft.com/azuredocs/containerapps-helloworld:latest` ✓
- CORS enabled via `properties.configuration.ingress.corsPolicy` ✓
- Secrets defined (database-url, session-secret, replit-client-secret) ✓
- Log Analytics connected via `logAnalyticsConfiguration` ✓

✅ **Storage Account Rules:**
- Local auth (key access) disabled ✓
- Public blob access disabled ✓

## 🚀 Next Steps to Deploy

### 1. Install Required Tools

```bash
# Install Azure Developer CLI
brew tap azure/azd && brew install azd

# Install Docker Desktop
brew install --cask docker
# Start Docker Desktop from Applications
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.azure.example .env.azure

# Generate session secret
openssl rand -base64 32

# Edit .env.azure with:
# - POSTGRES_ADMIN_PASSWORD (strong password)
# - SESSION_SECRET (from above)
# - REPLIT_CLIENT_ID (from Replit OAuth)
# - REPLIT_CLIENT_SECRET (from Replit OAuth)
```

### 3. Login to Azure

```bash
az login
azd auth login
```

### 4. Deploy Everything

```bash
# Load environment variables
export $(cat .env.azure | xargs)

# Deploy all resources + build and push container
azd up
```

This single command will:
1. Create resource group
2. Deploy PostgreSQL database
3. Deploy Container Registry
4. Build Docker image locally
5. Push image to Container Registry
6. Deploy Container App
7. Configure all secrets and environment variables
8. Return the public URL

### 5. Run Database Migrations

```bash
# Get PostgreSQL host from deployment
POSTGRES_HOST=$(az deployment group show \
  --resource-group rg-${AZURE_ENV_NAME} \
  --name main \
  --query properties.outputs.POSTGRES_HOST.value -o tsv)

# Set DATABASE_URL
export DATABASE_URL="postgresql://hivecraftadmin:${POSTGRES_ADMIN_PASSWORD}@${POSTGRES_HOST}:5432/hivecraft?sslmode=require"

# Run migrations
npm run db:push
```

### 6. Verify Deployment

```bash
# Get your app URL
azd env get-values | grep AZURE_CONTAINER_APP_ENDPOINT

# Visit the URL in your browser
# Test: https://your-app-url.azurecontainerapps.io
```

## 💰 Cost Estimate

Monthly costs (East US 2 region):
- **Container App**: ~$30-50/month (auto-scaling 1-3 instances)
- **PostgreSQL Flexible Server**: ~$15/month (Burstable B1ms)
- **Container Registry**: ~$5/month (Basic tier)
- **Storage Account**: ~$1/month (minimal usage)
- **Log Analytics**: ~$3/month (500MB included)

**Total: ~$55-70/month**

### Cost Optimization Tips
- Scale Container App to 0 replicas when not in use
- Use Dev/Test pricing tier for PostgreSQL
- Delete entire resource group when testing: `az group delete -n rg-${AZURE_ENV_NAME}`

## 🔧 Architecture

```
┌─────────────────────────────────────────────────────┐
│ Azure Container App (Node.js)                       │
│                                                      │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │  Express Server  │──────│  React SPA       │   │
│  │  (API + Auth)    │      │  (Vite built)    │   │
│  └──────────────────┘      └──────────────────┘   │
│          │                           │              │
│          │                           │              │
└──────────┼───────────────────────────┼─────────────┘
           │                           │
           ▼                           ▼
  ┌─────────────────┐         ┌──────────────┐
  │  PostgreSQL     │         │  Storage     │
  │  Flexible       │         │  Account     │
  │  Server         │         │  (Blobs)     │
  └─────────────────┘         └──────────────┘
```

### Key Features
- **Single Container**: Both frontend and backend in one container
- **Auto-scaling**: 1-3 instances based on HTTP requests
- **Managed Identity**: Secure access to Container Registry
- **SSL/TLS**: Automatic HTTPS with Azure-managed certificates
- **Session Storage**: PostgreSQL-backed sessions
- **File Storage**: Azure Blob Storage for uploads

## 📝 Wix Migration Note

This Azure deployment maintains feature parity with the Replit version. You can:

1. **Use this as production** while you prepare Wix Studio migration
2. **Reference this implementation** when building in Wix Studio/Velo
3. **Migrate users later** - same database schema, easy to export/import

The Wix Studio implementation guide is in `/docs/wix-studio-migration/`.

## 🐛 Troubleshooting

### Container won't start
```bash
# View logs
az containerapp logs show --name <app-name> -g rg-${AZURE_ENV_NAME} --follow
```

### Database connection fails
- Check firewall rules in Azure Portal
- Verify connection string has `?sslmode=require`
- Test from local machine first

### Build fails
```bash
# Test Docker build locally
docker build -t hivecraft-test .
docker run -p 3000:3000 -e DATABASE_URL=$DATABASE_URL -e PORT=3000 hivecraft-test
```

### Need to redeploy
```bash
# Quick redeploy after code changes
azd deploy
```

### Start fresh
```bash
# Delete everything
az group delete -n rg-${AZURE_ENV_NAME}

# Deploy again
azd up
```

## 📚 Documentation

- Full deployment guide: `docs/AZURE-DEPLOYMENT.md`
- Architecture overview: `docs/ARCHITECTURE.md`
- Wix migration: `docs/wix-studio-migration/README.md`
- Task tracking: `docs/TASKS.md`
