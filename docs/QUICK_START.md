# Quick Start Guide - Azure Enhancements

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 20+
- PostgreSQL
- Azure account (for production)

---

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env`:
```bash
# Required for local development
DATABASE_URL=postgresql://user:password@localhost:5432/hivecraft
SESSION_SECRET=your-random-secret-here

# OAuth (at least one required)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret

# Optional for local testing
AZURE_STORAGE_ACCOUNT_NAME=your-storage-account
AZURE_STORAGE_ACCOUNT_KEY=your-key
APPLICATIONINSIGHTS_CONNECTION_STRING=your-insights-connection
```

### 3. Setup Database
```bash
# Push schema to database
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

App running at: http://localhost:3000

---

## Test Features

### ✅ Real-Time Messaging
1. Open app in 2 browser windows
2. Login as different users (or use incognito)
3. Navigate to same project
4. Send message in one window
5. See instant delivery in other window

**Expected:**
- Message appears without refresh
- Typing indicator shows
- Connection status visible

### ✅ Email Notifications
For local testing, configure Azure Communication Services or use console logs:
```typescript
// Check server console for email preview
console.log('Would send email:', email)
```

**To enable real emails:**
1. Create Azure Communication Services resource
2. Get connection string
3. Add to `.env`:
```bash
AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING=endpoint=...
AZURE_COMMUNICATION_EMAIL_SENDER=DoNotReply@domain.com
```

### ✅ Application Insights
**Local mode:** Logs to console  
**Production mode:** Sends to Azure

**To enable:**
```bash
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...
```

View in Azure Portal → Application Insights → Live Metrics

---

## Production Deployment

### Option 1: Quick Deploy (Azure Portal)
1. Fork the repository
2. Go to Azure Portal
3. Create "Web App + Database"
4. Connect to GitHub repository
5. Azure auto-configures everything

### Option 2: Infrastructure as Code (Recommended)
```bash
# 1. Login to Azure
az login

# 2. Create resource group
az group create --name hivecraft-rg --location eastus2

# 3. Deploy infrastructure
az deployment group create \
  --resource-group hivecraft-rg \
  --template-file azure/infra/infrastructure.bicep \
  --parameters sqlAdminPassword="YourStrongPassword123!"

# 4. Get connection strings
az deployment group show \
  --resource-group hivecraft-rg \
  --name infrastructure \
  --query properties.outputs
```

See `/docs/AZURE_ENHANCEMENTS_DEPLOYMENT.md` for detailed steps.

---

## Configuration Guide

### Required Environment Variables

**Database:**
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

**Authentication:**
```bash
SESSION_SECRET=random-secret-string
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Azure Storage:**
```bash
AZURE_STORAGE_ACCOUNT_NAME=hivecraftstorage
AZURE_STORAGE_ACCOUNT_KEY=your-key
AZURE_STORAGE_CONTAINER_NAME=hivecraft-files
```

### Optional Environment Variables

**Application Insights:**
```bash
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...
```

**Email Notifications:**
```bash
AZURE_COMMUNICATION_EMAIL_CONNECTION_STRING=endpoint=...
AZURE_COMMUNICATION_EMAIL_SENDER=DoNotReply@domain.com
```

**SignalR (Azure-hosted):**
```bash
AZURE_SIGNALR_CONNECTION_STRING=Endpoint=https://...
```

---

## Feature Toggle

### Disable Email Notifications
Email service gracefully degrades if not configured:
```typescript
import { isEmailServiceConfigured } from './services/email-service'

if (isEmailServiceConfigured()) {
  await sendWelcomeEmail(user.email, user.name)
} else {
  console.log('Email service not configured, skipping email')
}
```

### Disable Application Insights
Monitoring automatically disables if not configured:
```typescript
import { isApplicationInsightsConfigured } from './services/application-insights'

// Returns false if APPLICATIONINSIGHTS_CONNECTION_STRING not set
console.log('Monitoring enabled:', isApplicationInsightsConfigured())
```

### Real-Time Messaging
Socket.IO works locally without Azure SignalR:
- **Local:** Uses Socket.IO directly (included)
- **Azure:** Can optionally use SignalR Service (set connection string)

---

## Common Issues

### Database Connection Error
```
Error: Connection refused
```

**Fix:**
1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Verify database exists:
```bash
createdb hivecraft
```

### OAuth Not Working
```
Error: Missing Google client ID
```

**Fix:**
1. Create OAuth app in Google Cloud Console
2. Add redirect URI: `http://localhost:5000/auth/google/callback`
3. Copy client ID and secret to `.env`

### Socket.IO Not Connecting
```
WebSocket connection failed
```

**Fix:**
1. Check browser console for errors
2. Verify server is running
3. Check CORS configuration
4. Try different port

### Email Not Sending
```
Error: Email service not configured
```

**Fix:**
This is expected in local development. To enable:
1. Create Azure Communication Services resource
2. Get connection string from Azure Portal
3. Add to `.env`

---

## Development Workflow

### 1. Make Changes
```bash
# Edit code
vim server/routes/projects.ts

# Server auto-reloads
```

### 2. Update Database Schema
```bash
# Edit schema
vim shared/schema.ts

# Apply changes
npm run db:push
```

### 3. Test Locally
```bash
# Run tests
npm test

# Manual testing
npm run dev
```

### 4. Deploy
```bash
git add .
git commit -m "feat: Add new feature"
git push origin main

# GitHub Actions auto-deploys
```

---

## Monitoring

### Local Development
```bash
# Server console shows:
9:15:30 PM [express] GET /api/projects 200 in 45ms
9:15:31 PM [express] POST /api/messages 201 in 67ms
Socket connected: abc123
User authenticated: user@example.com
```

### Production
Azure Portal → Application Insights → Live Metrics

**Key Metrics:**
- Request rate
- Response time
- Error rate
- Active connections

---

## Resources

**Documentation:**
- [Main README](../README.md)
- [Feature Guide](./AZURE_ENHANCEMENTS.md)
- [Deployment Guide](./AZURE_ENHANCEMENTS_DEPLOYMENT.md)
- [Migration Summary](./AZURE_MIGRATION_SUMMARY.md)

**Examples:**
- [Socket.IO Usage](./AZURE_ENHANCEMENTS.md#real-time-messaging)
- [Email Templates](./AZURE_ENHANCEMENTS.md#email-notifications)
- [Analytics Queries](./AZURE_ENHANCEMENTS.md#monitoring--alerts)

**Support:**
- GitHub Issues
- Azure Documentation
- Stack Overflow

---

## Next Steps

1. ✅ Local development working
2. ⏭️ Deploy to Azure
3. ⏭️ Configure custom domain
4. ⏭️ Set up monitoring alerts
5. ⏭️ Enable email notifications

Happy coding! 🚀
