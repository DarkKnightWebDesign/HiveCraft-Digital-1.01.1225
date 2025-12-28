# 🚀 Quick Start: Deploy to Azure

**Time required:** 1-2 hours (mostly waiting for Azure provisioning)

---

## Prerequisites Check

```bash
# 1. Azure CLI
az --version
# If not installed: brew install azure-cli

# 2. Azure Developer CLI
azd version
# If not installed: brew tap azure/azd && brew install azd

# 3. Docker
docker --version
# If not installed: brew install --cask docker
# Then start Docker Desktop from Applications

# 4. Login to Azure
az login
azd auth login
```

---

## Step 1: Configure Secrets (5 minutes)

```bash
# Copy template
cp .env.azure.example .env.azure

# Generate session secret
openssl rand -base64 32

# Edit .env.azure
nano .env.azure
```

**Required values in `.env.azure`:**
```bash
AZURE_ENV_NAME=hivecraft-prod
AZURE_LOCATION=eastus2
POSTGRES_ADMIN_PASSWORD=YourStrongPassword123!
SESSION_SECRET=<paste generated secret>
REPLIT_CLIENT_ID=<from Replit OAuth app>
REPLIT_CLIENT_SECRET=<from Replit OAuth app>
```

---

## Step 2: Deploy Everything (30-45 minutes)

```bash
# Load environment variables
export $(cat .env.azure | xargs)

# Deploy all infrastructure + application
azd up
```

**What this does:**
1. ✅ Creates resource group
2. ✅ Deploys PostgreSQL Flexible Server
3. ✅ Creates Container Registry
4. ✅ Builds Docker image (locally)
5. ✅ Pushes image to registry
6. ✅ Creates Container App Environment
7. ✅ Deploys Container App
8. ✅ Configures all secrets
9. ✅ Returns your public URL

**Expected output:**
```
SUCCESS: Your up workflow to provision and deploy to Azure completed in X minutes Y seconds.

Deploying services (azd deploy)
  (✓) Done: Deploying service web
  
Endpoint: https://ca<random>.eastus2.azurecontainerapps.io
```

---

## Step 3: Migrate Database (5 minutes)

```bash
# Get PostgreSQL host
POSTGRES_HOST=$(az deployment group show \
  --resource-group rg-${AZURE_ENV_NAME} \
  --name main \
  --query properties.outputs.POSTGRES_HOST.value -o tsv)

# Set DATABASE_URL for migration
export DATABASE_URL="postgresql://hivecraftadmin:${POSTGRES_ADMIN_PASSWORD}@${POSTGRES_HOST}:5432/hivecraft?sslmode=require"

# Run migrations
npm run db:push
```

**Expected output:**
```
✓ Pushing schema changes to database
✓ Done in 2.5s
```

---

## Step 4: Verify Deployment (2 minutes)

```bash
# Get your app URL
APP_URL=$(azd env get-values | grep AZURE_CONTAINER_APP_ENDPOINT | cut -d'=' -f2 | tr -d '"')

echo "Your app is live at: $APP_URL"

# Test health endpoint
curl ${APP_URL}/api/health
```

**Open in browser:**
```bash
open $APP_URL
```

**Test these pages:**
- ✅ Home page loads
- ✅ Client portal redirects to login
- ✅ Staff portal redirects to login
- ✅ Marketing pages (Services, Pricing, etc.)

---

## Step 5: Seed Demo Data (Optional, 5 minutes)

```bash
# Connect to production database
export DATABASE_URL="postgresql://hivecraftadmin:${POSTGRES_ADMIN_PASSWORD}@${POSTGRES_HOST}:5432/hivecraft?sslmode=require"

# Add demo projects (if you have a seed script)
npm run db:seed
```

---

## Common Issues & Fixes

### Issue: `azd` command not found

```bash
brew tap azure/azd
brew install azd
```

### Issue: Docker build fails

```bash
# Make sure Docker Desktop is running
docker ps

# If not running, start Docker Desktop from Applications
```

### Issue: Azure login fails

```bash
# Clear cached credentials
az logout
azd auth logout

# Login again
az login
azd auth login
```

### Issue: PostgreSQL connection refused

**Problem:** Firewall rules not applied yet

**Fix:** Wait 2-3 minutes after deployment, then try again

```bash
# Or manually add your IP
az postgres flexible-server firewall-rule create \
  --resource-group rg-${AZURE_ENV_NAME} \
  --name psql<random> \
  --rule-name AllowMyIP \
  --start-ip-address $(curl -s ifconfig.me) \
  --end-ip-address $(curl -s ifconfig.me)
```

### Issue: Container App won't start

**View logs:**
```bash
# Get container app name
CONTAINER_APP=$(az containerapp list -g rg-${AZURE_ENV_NAME} --query "[0].name" -o tsv)

# View logs
az containerapp logs show \
  --name $CONTAINER_APP \
  --resource-group rg-${AZURE_ENV_NAME} \
  --follow
```

### Issue: Build works locally but fails in Azure

**Test Docker build locally:**
```bash
# Build exactly as Azure will
docker build -t hivecraft-test .

# Test container
docker run -p 3000:3000 \
  -e DATABASE_URL=$DATABASE_URL \
  -e SESSION_SECRET=$SESSION_SECRET \
  -e PORT=3000 \
  -e NODE_ENV=production \
  hivecraft-test

# Visit http://localhost:3000
```

---

## Updating Your Deployment

### After code changes:

```bash
# Quick redeploy (rebuilds and deploys)
azd deploy
```

### After infrastructure changes:

```bash
# Full redeploy (updates Bicep + app)
azd up
```

### View deployment status:

```bash
# Check all resources
az resource list -g rg-${AZURE_ENV_NAME} -o table

# Check Container App status
az containerapp show \
  --name $CONTAINER_APP \
  --resource-group rg-${AZURE_ENV_NAME} \
  --query "properties.runningStatus" -o tsv
```

---

## Cost Management

### Check current costs:

```bash
# View cost analysis in Azure Portal
az group show --name rg-${AZURE_ENV_NAME} --query id -o tsv
# Copy the ID and visit:
# https://portal.azure.com/#blade/Microsoft_Azure_CostManagement/Menu/costanalysis
```

### Scale down for development:

```bash
# Scale to 0 replicas (stops compute costs)
az containerapp update \
  --name $CONTAINER_APP \
  --resource-group rg-${AZURE_ENV_NAME} \
  --min-replicas 0 \
  --max-replicas 1
```

### Delete everything:

```bash
# Delete entire resource group (careful!)
az group delete --name rg-${AZURE_ENV_NAME} --yes --no-wait
```

---

## Next Steps After Deployment

1. **Custom Domain** (optional)
   - Purchase domain (Namecheap, GoDaddy, etc.)
   - Add to Container App
   - Configure DNS records
   - See: https://learn.microsoft.com/azure/container-apps/custom-domains

2. **CI/CD Pipeline** (recommended)
   - Set up GitHub Actions
   - Auto-deploy on push to `main`
   - See: `docs/CI-CD.md` (to be created)

3. **Monitoring**
   - Set up alerts for errors
   - Configure Application Insights
   - See: Azure Portal → Your Container App → Monitoring

4. **Backup Strategy**
   - PostgreSQL automated backups (already enabled, 7 days)
   - Export critical data periodically

---

## Success Checklist

After following these steps, you should have:

- ✅ Container App running at Azure URL
- ✅ PostgreSQL database with schema migrated
- ✅ HTTPS enabled automatically
- ✅ Auto-scaling configured (1-3 replicas)
- ✅ All secrets stored securely in Azure
- ✅ Logs available in Log Analytics
- ✅ Ready for custom domain
- ✅ Ready for production traffic

---

## Get Help

- **View logs**: Azure Portal → Container App → Logs
- **Check costs**: Azure Portal → Cost Management
- **Documentation**: `AZURE-SETUP-COMPLETE.md`
- **Architecture**: `docs/AZURE-ARCHITECTURE-DECISION.md`
- **Troubleshooting**: `docs/AZURE-DEPLOYMENT.md`

---

## Emergency Rollback

If something goes wrong:

```bash
# 1. View previous deployments
az deployment group list -g rg-${AZURE_ENV_NAME} -o table

# 2. Redeploy previous version
az deployment group create \
  --resource-group rg-${AZURE_ENV_NAME} \
  --template-file azure/infra/main.bicep \
  --parameters azure/infra/main.parameters.bicepparam

# 3. Or delete and start fresh
az group delete --name rg-${AZURE_ENV_NAME} --yes
azd up
```

---

**You're all set! 🎉**

Visit your app at the URL from `azd up` and enjoy your Azure-hosted HiveCraft platform!
