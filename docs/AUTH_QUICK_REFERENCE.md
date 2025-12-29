# 🔐 Authentication Quick Reference

## Available Login Methods

| Method | Status | Setup Required |
|--------|--------|----------------|
| ✅ Email/Password | **Ready** | None - Works now! |
| 🔵 Google OAuth | Ready | Need Google credentials |
| 📘 Facebook OAuth | Ready | Need Facebook App ID |
| 🐙 GitHub OAuth | Ready | Need GitHub OAuth App |
| 📱 SMS Verification | Ready | Need Azure Communication Services |

---

## Quick Start

### 1. Test Email/Password (Works Now!)
```bash
# Start server
npm run dev

# Visit http://localhost:3000/register
# Create account → Auto-login → Redirect to portal ✅
```

### 2. Setup Google OAuth
```bash
# Get credentials from: https://console.cloud.google.com/apis/credentials
# Add to .env:
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret

# Callback URL: http://localhost:3000/api/auth/google/callback
```

### 3. Setup Facebook OAuth
```bash
# Get credentials from: https://developers.facebook.com/apps/
# Add to .env:
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-secret

# Callback URL: http://localhost:3000/api/auth/facebook/callback
```

### 4. Setup GitHub OAuth
```bash
# Get credentials from: https://github.com/settings/developers
# Add to .env:
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-secret

# Callback URL: http://localhost:3000/api/auth/github/callback
```

### 5. Setup Azure SMS (Optional)
```bash
# Create Azure Communication Services resource
# Get phone number (toll-free recommended)
# ⚠️ Must complete verification for US toll-free numbers
# Add to .env:
ACS_CONNECTION_STRING=endpoint=https://...;accesskey=...
ACS_PHONE_NUMBER=+1234567890
```

---

## API Endpoints

### Email/Password
```bash
POST /api/auth/register   # Create account
POST /api/auth/login      # Login
POST /api/auth/logout     # Logout
GET  /api/auth/user       # Get current user
```

### OAuth (Browser Redirects)
```bash
GET /api/auth/google           # Start Google login
GET /api/auth/google/callback  # Google callback
GET /api/auth/facebook         # Start Facebook login
GET /api/auth/facebook/callback # Facebook callback
GET /api/auth/github           # Start GitHub login
GET /api/auth/github/callback  # GitHub callback
```

### SMS Verification
```bash
GET  /api/auth/sms/status     # Check if configured
POST /api/auth/sms/send       # Send verification code
POST /api/auth/sms/verify     # Verify code
```

---

## Database Schema

### users table (updated)
```typescript
{
  id: string                    // UUID
  email: string                 // Unique, required
  passwordHash?: string         // Email/password auth
  name?: string                 // Display name
  role: string                  // "admin" | "client" | "staff"
  
  // OAuth provider IDs
  googleId?: string             // Google account ID
  facebookId?: string           // Facebook account ID
  githubId?: string             // GitHub account ID
  
  // Phone verification
  phoneNumber?: string          // E.164 format: +14255551234
  phoneVerified: string         // "true" | "false"
  verificationCode?: string     // 6-digit code
  verificationCodeExpiry?: Date // Code expiration
  
  // Metadata
  profileImageUrl?: string
  createdAt: Date
  updatedAt: Date
}
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SESSION_SECRET=your-random-32-byte-secret
BASE_URL=http://localhost:3000

# OAuth (optional - only enable what you need)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Azure SMS (optional)
ACS_CONNECTION_STRING=
ACS_PHONE_NUMBER=
```

---

## Testing Checklist

### Local Testing
- [ ] Email/password registration works
- [ ] Email/password login works
- [ ] Google OAuth redirects correctly
- [ ] Facebook OAuth redirects correctly
- [ ] GitHub OAuth redirects correctly
- [ ] SMS verification code sends
- [ ] SMS verification code validates
- [ ] Role-based redirect (admin → /admin, client → /portal)

### Before Production Deploy
- [ ] Add production callback URLs to OAuth providers
- [ ] Update BASE_URL environment variable
- [ ] Set all OAuth secrets in Azure env vars
- [ ] Set ACS credentials in Azure env vars
- [ ] Test all OAuth flows on production domain
- [ ] Verify SSL/HTTPS working

---

## Common Issues

### OAuth Issues
```bash
# redirect_uri_mismatch
# → Add exact callback URL to provider console

# invalid_client
# → Check CLIENT_ID and CLIENT_SECRET match

# No email returned
# → Enable required scopes/permissions
```

### SMS Issues
```bash
# "SMS service not configured"
# → Check ACS_CONNECTION_STRING and ACS_PHONE_NUMBER

# SMS not received
# → Verify toll-free number verification status in Azure

# "Invalid phone number"
# → Use E.164 format: +14255551234 (with country code)
```

---

## Files Modified

### Server
- ✅ `server/auth/oauth-config.ts` - Passport strategies
- ✅ `server/auth/sms-service.ts` - SMS verification
- ✅ `server/auth/email-auth.ts` - Email/password auth
- ✅ `server/auth/routes.ts` - Auth endpoints
- ✅ `server/routes.ts` - Passport initialization
- ✅ `server/types/session.d.ts` - TypeScript session types

### Client
- ✅ `client/src/pages/login.tsx` - OAuth buttons
- ✅ `client/src/pages/register.tsx` - OAuth buttons

### Database
- ✅ `shared/models/auth.ts` - Schema with OAuth fields

### Documentation
- ✅ `docs/AUTH_SETUP.md` - Complete setup guide
- ✅ `docs/OAUTH_SMS_IMPLEMENTATION.md` - Implementation summary
- ✅ `.env.example` - Environment template

---

## Next Steps

1. **Choose OAuth Providers**
   - Decide which ones to enable (Google, Facebook, GitHub)
   - Setup only what you need

2. **Get Credentials**
   - Follow `docs/AUTH_SETUP.md` for each provider
   - Add to `.env` file

3. **Test Locally**
   - Email/password already works!
   - Test each OAuth provider after setup

4. **Optional: Setup SMS**
   - Create Azure Communication Services
   - Get phone number
   - Complete verification (US toll-free)

5. **Deploy**
   - Update Bicep with env vars
   - Set production callback URLs
   - Deploy with `azd up`

---

## Documentation

📖 **Full Guide**: `docs/AUTH_SETUP.md`  
📋 **Implementation Details**: `docs/OAUTH_SMS_IMPLEMENTATION.md`  
🔧 **Environment Template**: `.env.example`

---

## Support Resources

- **Google OAuth**: https://console.cloud.google.com/apis/credentials
- **Facebook Apps**: https://developers.facebook.com/apps/
- **GitHub OAuth**: https://github.com/settings/developers
- **Azure Portal**: https://portal.azure.com/
- **Azure Communication Services**: https://learn.microsoft.com/azure/communication-services/

---

**Status**: ✅ All features implemented and ready for testing!

**Current**: Email/password auth works now. OAuth and SMS require external service setup.
