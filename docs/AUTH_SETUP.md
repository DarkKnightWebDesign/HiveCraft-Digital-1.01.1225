# Authentication Setup Guide

This guide covers setting up OAuth providers (Google, Facebook, GitHub) and Azure SMS verification for HiveCraft Digital.

## Table of Contents
1. [Email/Password Authentication](#emailpassword-authentication)
2. [Google OAuth](#google-oauth)
3. [Facebook OAuth](#facebook-oauth)
4. [GitHub OAuth](#github-oauth)
5. [Azure SMS Verification](#azure-sms-verification)
6. [Testing Locally](#testing-locally)

---

## Email/Password Authentication

✅ **Already Configured** - Works out of the box with bcryptjs password hashing.

### Features:
- Secure password hashing with bcryptjs (10 salt rounds)
- Session-based authentication
- Role-based access control (admin/client)
- Auto-redirect based on user role

---

## Google OAuth

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API** (APIs & Services → Library)

### 2. Create OAuth Credentials
1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth 2.0 Client ID**
3. Configure consent screen if prompted:
   - User Type: External
   - App name: HiveCraft Digital
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
4. Application type: **Web application**
5. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/google/callback
   https://your-domain.com/api/auth/google/callback
   ```
6. Copy **Client ID** and **Client Secret**

### 3. Add to Environment Variables
```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Test
- Visit `http://localhost:3000/login`
- Click "Continue with Google"
- Authorize the app
- Should redirect to `/portal` or `/admin`

---

## Facebook OAuth

### 1. Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps → Create App**
3. Use case: **Authenticate and request data from users**
4. App type: **Consumer**
5. Display name: HiveCraft Digital
6. Contact email: your-email@example.com

### 2. Configure Facebook Login
1. In app dashboard, go to **Products → Add Product**
2. Add **Facebook Login**
3. Settings → Valid OAuth Redirect URIs:
   ```
   http://localhost:3000/api/auth/facebook/callback
   https://your-domain.com/api/auth/facebook/callback
   ```
4. Save changes

### 3. Get App Credentials
1. Go to **Settings → Basic**
2. Copy **App ID** and **App Secret**

### 4. Add to Environment Variables
```bash
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

### 5. Test
- Visit `http://localhost:3000/login`
- Click "Continue with Facebook"
- Authorize the app
- Should redirect to portal

---

## GitHub OAuth

### 1. Create GitHub OAuth App
1. Go to [GitHub Settings → Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps → New OAuth App**
3. Fill in details:
   - Application name: HiveCraft Digital
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/github/callback`
4. Click **Register application**

### 2. Get Credentials
1. Copy **Client ID**
2. Generate and copy **Client Secret**

### 3. Add to Environment Variables
```bash
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 4. Test
- Visit `http://localhost:3000/login`
- Click "Continue with GitHub"
- Authorize the app
- Should redirect to portal

---

## Azure SMS Verification

### 1. Create Azure Communication Services Resource

#### Option A: Azure Portal (GUI)
1. Go to [Azure Portal](https://portal.azure.com/)
2. Click **Create a resource**
3. Search for **Communication Services**
4. Click **Create**
5. Fill in details:
   - Subscription: Select your subscription
   - Resource group: Create new or select existing
   - Name: `hivecraft-communication`
   - Region: Select closest region
6. Click **Review + create → Create**

#### Option B: Azure CLI
```bash
# Create resource group
az group create --name rg-hivecraft-communication --location westus2

# Create Communication Services resource
az communication create \
  --name hivecraft-communication \
  --resource-group rg-hivecraft-communication \
  --location global \
  --data-location UnitedStates
```

### 2. Get Connection String
1. Go to your Communication Services resource
2. Navigate to **Keys** in left menu
3. Copy **Connection string**

### 3. Acquire SMS-Enabled Phone Number

#### Prerequisites:
- Valid Azure subscription with payment method
- For US toll-free numbers: Must complete verification

#### Steps:
1. In Communication Services resource, go to **Phone numbers**
2. Click **Get** → **Get a phone number**
3. Select:
   - Use case: **Transactional**
   - Features: **Send SMS**
   - Country/Region: **United States**
   - Number type: **Toll-free** (recommended for SMS)
4. Click **Search** → Select number → **Buy**
5. Copy phone number (format: +1234567890)

#### ⚠️ Toll-Free Verification (Required for US)
- Toll-free numbers require verification to send SMS
- Go to **Telephony and SMS → Regulatory Documents**
- Submit required information:
  - Business details
  - Use case description
  - Sample message content
- Verification takes 2-5 business days
- Unverified numbers CANNOT send SMS to US/CA

### 4. Add to Environment Variables
```bash
ACS_CONNECTION_STRING="endpoint=https://hivecraft-communication.communication.azure.com/;accesskey=your-access-key"
ACS_PHONE_NUMBER=+1234567890
```

### 5. Test SMS Service

#### Check Configuration
```bash
# In your app, check SMS status endpoint
curl http://localhost:3000/api/auth/sms/status

# Should return: {"configured": true}
```

#### Send Test Verification Code
```bash
# Login to get session
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Send SMS verification
curl -X POST http://localhost:3000/api/auth/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+14255551234"}' \
  --cookie-jar cookies.txt

# Verify code
curl -X POST http://localhost:3000/api/auth/sms/verify \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}' \
  --cookie cookies.txt
```

### 6. SMS Flow in UI

Users can verify their phone number from the profile page:
1. Login to account
2. Go to Profile settings
3. Click "Add Phone Number"
4. Enter phone number (E.164 format)
5. Click "Send Verification Code"
6. Check phone for SMS
7. Enter 6-digit code
8. Phone verified ✅

### SMS Service Features
- ✅ 6-digit verification codes
- ✅ 10-minute code expiration
- ✅ E.164 phone number validation
- ✅ Automatic retry handling
- ✅ Secure code storage (hashed)
- ✅ One code per user at a time

---

## Testing Locally

### 1. Set Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Test Each OAuth Provider

#### Email/Password
1. Visit http://localhost:3000/register
2. Create account
3. Should auto-login and redirect to /portal

#### Google OAuth
1. Visit http://localhost:3000/login
2. Click "Continue with Google"
3. Should redirect to Google consent screen
4. After authorization, redirects to /portal

#### Facebook OAuth
1. Visit http://localhost:3000/login
2. Click "Continue with Facebook"
3. Should redirect to Facebook login
4. After authorization, redirects to /portal

#### GitHub OAuth
1. Visit http://localhost:3000/login
2. Click "Continue with GitHub"
3. Should redirect to GitHub authorization
4. After authorization, redirects to /portal

#### SMS Verification (requires Azure setup)
1. Login with any method
2. Go to profile/settings
3. Enter phone number
4. Click "Send Code"
5. Check phone for SMS
6. Enter code
7. Phone verified ✅

---

## Troubleshooting

### Google OAuth Issues
- **"redirect_uri_mismatch"**: Add exact callback URL to Google Console
- **"invalid_client"**: Check CLIENT_ID and CLIENT_SECRET
- **No email returned**: Enable Google+ API

### Facebook OAuth Issues
- **"Can't Load URL"**: Add redirect URI to Facebook app settings
- **App not live**: Set app to "Live" in Settings → Basic
- **Invalid credentials**: Regenerate App Secret

### GitHub OAuth Issues
- **"redirect_uri_mismatch"**: Must match exactly in GitHub app
- **No email**: User must have public email or grant email scope
- **Invalid credentials**: Regenerate Client Secret

### Azure SMS Issues
- **"SMS service not configured"**: Check ACS_CONNECTION_STRING and ACS_PHONE_NUMBER
- **SMS not received**: Verify toll-free number verification status
- **"Invalid phone number"**: Must use E.164 format (+14255551234)
- **Rate limiting**: Azure limits SMS sends per phone number

---

## Security Best Practices

### Environment Variables
- ✅ Never commit `.env` to version control
- ✅ Use different credentials for dev/staging/production
- ✅ Rotate secrets regularly
- ✅ Use Azure Key Vault in production

### OAuth
- ✅ Always use HTTPS in production
- ✅ Validate redirect URIs
- ✅ Check for state parameter (CSRF protection)
- ✅ Limit OAuth scopes to minimum required

### SMS
- ✅ Rate limit verification attempts (prevent abuse)
- ✅ Expire codes after 10 minutes
- ✅ Log failed verification attempts
- ✅ Clear codes after successful verification

---

## Production Deployment

### Update Callback URLs
When deploying to production:

1. **Google**: Add `https://your-domain.com/api/auth/google/callback`
2. **Facebook**: Add `https://your-domain.com/api/auth/facebook/callback`
3. **GitHub**: Add `https://your-domain.com/api/auth/github/callback`

### Update Environment Variables
```bash
BASE_URL=https://your-domain.com
NODE_ENV=production
```

### Azure Bicep Update
Add OAuth and SMS environment variables to `azure/infra/infrastructure.bicep`:

```bicep
{
  name: 'GOOGLE_CLIENT_ID'
  value: googleClientId
}
{
  name: 'GOOGLE_CLIENT_SECRET'
  value: googleClientSecret
}
{
  name: 'FACEBOOK_APP_ID'
  value: facebookAppId
}
{
  name: 'FACEBOOK_APP_SECRET'
  value: facebookAppSecret
}
{
  name: 'GITHUB_CLIENT_ID'
  value: githubClientId
}
{
  name: 'GITHUB_CLIENT_SECRET'
  value: githubClientSecret
}
{
  name: 'ACS_CONNECTION_STRING'
  value: acsConnectionString
}
{
  name: 'ACS_PHONE_NUMBER'
  value: acsPhoneNumber
}
```

Then set with `azd env set`:
```bash
azd env set GOOGLE_CLIENT_ID "your-id"
azd env set GOOGLE_CLIENT_SECRET "your-secret"
# ... etc
```

---

## Support

For issues:
- Check Azure Communication Services status: https://status.azure.com
- Review logs: `npm run dev` shows detailed error messages
- Contact support: support@hivecraftdigital.com
