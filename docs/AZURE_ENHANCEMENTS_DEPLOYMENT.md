# Azure Enhancements Deployment Guide

This guide covers deploying all the premium enhancements to Azure:
1. **Real-time Messaging** - Azure SignalR Service
2. **Email Notifications** - Azure Communication Services
3. **Application Insights** - Monitoring and Analytics
4. **Custom Domain** - Professional branding

## Prerequisites

- Azure CLI installed (`az --version`)
- Azure subscription with permissions
- GitHub account for CI/CD
- Node.js 20+ installed
- PostgreSQL client (for local development)

## Step 1: Deploy Infrastructure

### 1.1 Login to Azure
```bash
az login
az account set --subscription "Your Subscription Name"
```

### 1.2 Create Resource Group
```bash
az group create \
  --name hivecraft-rg \
  --location eastus2
```

### 1.3 Deploy Bicep Template
```bash
# Generate a strong SQL password
SQL_PASSWORD=$(openssl rand -base64 24)

# Deploy infrastructure
az deployment group create \
  --resource-group hivecraft-rg \
  --template-file azure/infra/infrastructure.bicep \
  --parameters sqlAdminPassword="$SQL_PASSWORD" \
  --parameters envName=prod
```

This will create:
- Azure SQL Database
- Azure Blob Storage
- App Service (API)
- Static Web App (Frontend)
- **Application Insights** (NEW)
- **Azure Communication Services** (NEW)
- **SignalR Service** (NEW)

### 1.4 Save Deployment Outputs
```bash
# Get connection strings
az deployment group show \
  --resource-group hivecraft-rg \
  --name infrastructure \
  --query properties.outputs
```

Save these values - you'll need them for environment variables.

## Step 2: Configure Email Service

### 2.1 Verify Email Domain
Azure Communication Services provides a free Azure-managed domain for testing:
- Domain format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.azurecomm.net`
- Sender: `DoNotReply@xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.azurecomm.net`

For production with custom domain:
```bash
# Add custom domain
az communication email domain create \
  --email-service-name hivecraft-email-prod \
  --resource-group hivecraft-rg \
  --domain-name yourdomain.com \
  --location global

# Add DNS records (follow Azure portal instructions)
```

### 2.2 Test Email Service
```bash
# Get connection string
COMM_STRING=$(az communication show \
  --name hivecraft-comms-prod \
  --resource-group hivecraft-rg \
  --query "primaryConnectionString" -o tsv)

echo "AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING=$COMM_STRING"
```

## Step 3: Configure Application Insights

### 3.1 Get Instrumentation Key
```bash
# Get App Insights connection string
INSIGHTS_STRING=$(az monitor app-insights component show \
  --app hivecraft-insights-prod \
  --resource-group hivecraft-rg \
  --query "connectionString" -o tsv)

echo "APPLICATIONINSIGHTS_CONNECTION_STRING=$INSIGHTS_STRING"
```

### 3.2 Configure Alerts (Optional)
Create alerts for:
- High error rates
- Slow response times
- Failed dependencies

```bash
# Example: Alert on 500 errors
az monitor metrics alert create \
  --name "High Error Rate" \
  --resource-group hivecraft-rg \
  --scopes "/subscriptions/.../hivecraft-api-prod" \
  --condition "count requests/failed > 10" \
  --window-size 5m \
  --evaluation-frequency 1m
```

## Step 4: Configure SignalR Service

### 4.1 Get Connection String
```bash
# Get SignalR connection string
SIGNALR_STRING=$(az signalr key list \
  --name hivecraft-signalr-prod \
  --resource-group hivecraft-rg \
  --query "primaryConnectionString" -o tsv)

echo "AZURE_SIGNALR_CONNECTION_STRING=$SIGNALR_STRING"
```

### 4.2 Update CORS Settings
```bash
az signalr cors add \
  --name hivecraft-signalr-prod \
  --resource-group hivecraft-rg \
  --allowed-origins "https://yourdomain.com" "https://*.azurestaticapps.net"
```

## Step 5: Update App Service Configuration

### 5.1 Set Environment Variables
```bash
APP_NAME="hivecraft-api-prod"

az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group hivecraft-rg \
  --settings \
    "APPLICATIONINSIGHTS_CONNECTION_STRING=$INSIGHTS_STRING" \
    "AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING=$COMM_STRING" \
    "AZURE_SIGNALR_CONNECTION_STRING=$SIGNALR_STRING" \
    "AZURE_COMMUNICATION_EMAIL_SENDER=DoNotReply@yourdomain.com"
```

### 5.2 Enable WebSockets
```bash
az webapp config set \
  --name $APP_NAME \
  --resource-group hivecraft-rg \
  --web-sockets-enabled true
```

## Step 6: Configure Custom Domain (Static Web App)

### 6.1 Add Custom Domain
```bash
# Get Static Web App details
STATIC_APP_NAME="hivecraft-web-prod"

# Add custom domain
az staticwebapp hostname set \
  --name $STATIC_APP_NAME \
  --resource-group hivecraft-rg \
  --hostname "app.yourdomain.com"
```

### 6.2 Configure DNS
Add CNAME record:
```
Type: CNAME
Name: app
Value: <static-web-app-default-hostname>
TTL: 3600
```

### 6.3 Enable SSL (Automatic)
Azure Static Web Apps automatically provisions SSL certificates for custom domains.

## Step 7: Update OAuth Redirect URIs

Update authorized redirect URIs in each OAuth provider:

### Google Cloud Console
- Add: `https://app.yourdomain.com/auth/google/callback`
- Add: `https://hivecraft-api-prod.azurewebsites.net/auth/google/callback`

### Facebook Developers
- Add: `https://app.yourdomain.com/auth/facebook/callback`
- Add: `https://hivecraft-api-prod.azurewebsites.net/auth/facebook/callback`

### GitHub OAuth Apps
- Add: `https://app.yourdomain.com/auth/github/callback`
- Add: `https://hivecraft-api-prod.azurewebsites.net/auth/github/callback`

## Step 8: Deploy Application

### 8.1 Setup GitHub Actions
GitHub Actions workflow is already configured in `.github/workflows/azure-deploy.yml`

### 8.2 Add Secrets to GitHub
Go to repository Settings → Secrets and add:
- `AZURE_CREDENTIALS` (Service Principal JSON)
- `SQL_ADMIN_PASSWORD`
- `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_SECRET`
- `GITHUB_CLIENT_SECRET`

### 8.3 Create Service Principal
```bash
# Create service principal for GitHub Actions
az ad sp create-for-rbac \
  --name "hivecraft-github-actions" \
  --role contributor \
  --scopes /subscriptions/<subscription-id>/resourceGroups/hivecraft-rg \
  --sdk-auth
```

Copy the JSON output to GitHub secret `AZURE_CREDENTIALS`.

### 8.4 Push to Deploy
```bash
git add .
git commit -m "feat: Add Azure enhancements (SignalR, Email, Analytics)"
git push origin main
```

GitHub Actions will:
1. Build the application
2. Run database migrations
3. Deploy API to App Service
4. Deploy frontend to Static Web App

## Step 9: Run Database Migrations

### 9.1 Connect to Azure SQL
```bash
# Get SQL connection details
SQL_SERVER=$(az sql server show \
  --name hivecraft-sql-prod \
  --resource-group hivecraft-rg \
  --query "fullyQualifiedDomainName" -o tsv)

DATABASE_URL="postgresql://hivecraftadmin:$SQL_PASSWORD@$SQL_SERVER:5432/hivecraft-db-prod?sslmode=require"
```

### 9.2 Apply Migrations
```bash
# Using Drizzle
npm run db:push

# Or manually apply SQL files
psql "$DATABASE_URL" -f azure/db/migrations/001_initial_schema.sql
```

## Step 10: Verify Deployment

### 10.1 Check Application Insights
Visit Azure Portal → Application Insights → Live Metrics

You should see:
- Server requests
- Server response time
- Server request rate
- WebSocket connections

### 10.2 Test Email Service
```bash
curl -X POST https://hivecraft-api-prod.azurewebsites.net/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

### 10.3 Test Real-Time Messaging
1. Open browser console
2. Navigate to a project
3. Check for "Socket connected" message
4. Send a message
5. Verify real-time update in another browser

### 10.4 Check Custom Domain
```bash
# Test SSL certificate
curl -I https://app.yourdomain.com

# Should return:
# HTTP/2 200
# strict-transport-security: max-age=31536000
```

## Step 11: Performance Tuning

### 11.1 Scale App Service Plan
```bash
# Upgrade to production tier
az appservice plan update \
  --name hivecraft-plan-prod \
  --resource-group hivecraft-rg \
  --sku P1V2
```

### 11.2 Enable CDN (Optional)
```bash
# Create CDN profile
az cdn profile create \
  --name hivecraft-cdn \
  --resource-group hivecraft-rg \
  --sku Standard_Microsoft

# Add endpoint
az cdn endpoint create \
  --name hivecraft-endpoint \
  --profile-name hivecraft-cdn \
  --resource-group hivecraft-rg \
  --origin hivecraft-web-prod.azurestaticapps.net
```

### 11.3 Configure Connection Pooling
Update database connection pool settings in `server/db.ts`

## Monitoring & Maintenance

### Daily Monitoring
- Application Insights → Failures
- Application Insights → Performance
- Email delivery reports

### Weekly Reviews
- Review Application Insights dashboards
- Check error logs
- Monitor email bounce rates
- Review WebSocket connection metrics

### Cost Monitoring
```bash
# Check Azure costs
az consumption usage list \
  --start-date 2025-01-01 \
  --end-date 2025-01-31 \
  --query "[?resourceGroup=='hivecraft-rg']"
```

## Troubleshooting

### Email Not Sending
1. Check Communication Services status
2. Verify connection string
3. Check sender domain verification
4. Review Application Insights logs

### Real-Time Not Working
1. Verify WebSockets enabled on App Service
2. Check SignalR CORS settings
3. Review browser console for connection errors
4. Check firewall rules

### High Costs
1. Downgrade SignalR from Standard to Free (limited connections)
2. Reduce Application Insights retention
3. Optimize database tier
4. Enable auto-scaling

## Cost Estimation (Monthly)

**Free Tier (Development):**
- App Service B1: $13
- Azure SQL Basic: $5
- Storage: $1
- Static Web App: Free
- SignalR Free: Free
- Application Insights: Free (1GB/month)
- Communication Services: Pay-per-use ($0.0005/email)

**Total: ~$20/month + email costs**

**Production Tier:**
- App Service P1V2: $73
- Azure SQL S1: $30
- Storage: $5
- Static Web App Standard: $9
- SignalR Standard: $50
- Application Insights: $2.30/GB
- Communication Services: Pay-per-use

**Total: ~$170/month + usage**

## Support

For issues:
1. Check Application Insights logs
2. Review Azure Service Health
3. Contact Azure Support
4. Check GitHub Issues

## Next Steps

- [ ] Set up monitoring alerts
- [ ] Configure backup policies
- [ ] Implement CI/CD testing
- [ ] Set up staging environment
- [ ] Configure disaster recovery
- [ ] Implement rate limiting
- [ ] Add API versioning
- [ ] Set up log aggregation
