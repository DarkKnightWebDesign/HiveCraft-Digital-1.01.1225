# HiveCraft Digital Platform

A comprehensive web design and development agency platform with marketing website, client portal, and staff back office. Built with Azure-first architecture for scalability and security.

## What This Project Is

HiveCraft Digital is a full-stack platform for a web design agency featuring:

- **Marketing Website** - 7 public pages showcasing services, process, pricing, and portfolio
- **Client Portal** - Authenticated area where clients track their projects, view previews, send messages, upload files
- **Staff Back Office** - Admin dashboard for team members to manage all client projects, milestones, and team assignments

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Frontend** | |
| React 18 + TypeScript | Frontend framework |
| Vite | Build tool and dev server |
| wouter | Client-side routing |
| TanStack Query | Server state management |
| shadcn/ui | UI component library |
| Tailwind CSS | Styling |
| **Backend** | |
| Express.js | REST API server |
| PostgreSQL | Database |
| Drizzle ORM | Database queries and migrations |
| **Authentication** | |
| Passport.js | OAuth strategies |
| Google OAuth 2.0 | Social login |
| Facebook & GitHub OAuth | Social login (optional) |
| express-session | Session management |
| **Azure Services** | |
| Azure Static Web Apps | Frontend hosting |
| Azure App Service | Backend API hosting |
| Azure SQL Database | PostgreSQL database |
| Azure Blob Storage | File uploads and storage |
| Azure Communication Services | SMS verification (optional) |

## How to Run Locally

### Prerequisites
- Node.js 20+ and npm
- PostgreSQL database (local or Azure)
- Azure Storage Account (for file uploads)
- Google OAuth credentials (see setup below)

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env and fill in:
# - DATABASE_URL (PostgreSQL connection string)
# - SESSION_SECRET (generate with: openssl rand -base64 32)
# - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
# - AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app runs on **http://localhost:3000**

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Set authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
4. Copy Client ID and Client Secret to `.env`

See [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md) for detailed authentication setup.

## Where to Start Reading the Code

| File | Purpose |
|------|---------|
| `shared/schema.ts` | **Start here** - Database schema and TypeScript types |
| `server/routes.ts` | Main API routes registration |
| `server/routes/projects.ts` | Project management API (CRUD, files, messages) |
| `server/auth/oauth-config.ts` | OAuth strategies (Google, Facebook, GitHub) |
| `server/storage/azure-blob.ts` | Azure Blob Storage integration |
| `server/storage.ts` | Database operations |
| `client/src/App.tsx` | Frontend routes and providers |
| `client/src/pages/login.tsx` | Login page with OAuth buttons |

## Project Structure

```
├── client/src/
│   ├── components/    # UI components (marketing, portal, shadcn)
│   ├── pages/         # Page components
│   │   ├── admin/     # Staff back office
│   │   └── portal/    # Client portal
│   ├── hooks/         # Custom React hooks (auth, mobile, toast)
│   └── lib/           # Utilities
├── server/
│   ├── routes.ts          # API routes registration
│   ├── routes/
│   │   └── projects.ts    # Project management endpoints
│   ├── auth/
│   │   ├── oauth-config.ts    # Passport OAuth strategies
│   │   ├── routes.ts          # OAuth callbacks
│   │   ├── email-auth.ts      # Email/password auth
│   │   └── sms-service.ts     # Azure SMS verification
│   ├── storage/
│   │   └── azure-blob.ts      # File upload to Azure Blob
│   └── storage.ts         # Database layer
├── shared/
│   ├── schema.ts          # Database schema (single source of truth)
│   └── models/auth.ts     # User and session types
├── azure/
│   ├── infra/
│   │   └── infrastructure.bicep    # Azure resources (Bicep IaC)
│   └── db/migrations/              # SQL migrations
├── .github/workflows/
│   └── azure-deploy.yml            # CI/CD pipeline
├── docs/
│   ├── ARCHITECTURE.md         # System architecture
│   ├── AUTH_SETUP.md           # Authentication guide
│   ├── OAUTH_SMS_IMPLEMENTATION.md
│   └── AUTH_QUICK_REFERENCE.md
└── azure.yaml                  # Azure Developer CLI config
```

## Key Features

### Authentication
- **OAuth 2.0** - Google, Facebook, GitHub social login
- **Email/Password** - Traditional authentication with bcrypt hashing
- **SMS Verification** - Azure Communication Services (optional)
- **Session Management** - PostgreSQL-backed sessions with 7-day expiry
- **Role-Based Access** - Client, Admin, Project Manager, Designer, Developer roles

### Marketing Website
- Home page with hero section
- Services grid with 3D card effects
- 5-stage process timeline
- 3-tier pricing table (Launch, Growth, Scale)
- Portfolio showcase
- About page with team
- Contact form with email notifications

### Client Portal
- **Projects Dashboard** - View all assigned projects with status cards
- **Project Details** with 6 tabs:
  - **Overview** - Progress bar, team members, quick actions
  - **Timeline** - Milestones with approval workflows
  - **Previews** - Approve/reject staging links
  - **Files** - Upload/download project files (Azure Blob Storage)
  - **Messages** - Real-time communication with staff
  - **Billing** - Invoices and payment tracking

### Staff Back Office
- **Admin Dashboard** - Analytics, stats, recent activity
- **All Projects View** - Filter, search, sort all projects
- **Project Management** - Create, update, delete projects
- **Milestone Tracking** - Create and manage project milestones
- **File Management** - Upload files to Azure Blob Storage
- **Team Assignments** - Assign roles to projects
- **Client Management** - View all clients, projects, billing

### File Upload System
- **Azure Blob Storage** - Secure cloud storage
- **50MB file size limit** - Images, PDFs, documents, videos
- **Automatic cleanup** - Files deleted when project deleted
- **Access control** - Clients see only their project files
- **File types** - Images (JPEG, PNG, GIF, WebP), PDFs, Office docs, ZIP, videos

## API Endpoints

### Authentication
- `POST /api/register` - Email/password registration
- `POST /api/login` - Email/password login
- `POST /api/logout` - End session
- `GET /api/auth/user` - Get current user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/facebook` - Facebook OAuth login
- `GET /api/auth/github` - GitHub OAuth login

### Projects
- `GET /api/projects` - List projects (filtered by role)
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project (admin only)
- `PATCH /api/projects/:id` - Update project (admin only)
- `DELETE /api/projects/:id` - Delete project (admin only)

### Milestones
- `POST /api/projects/:id/milestones` - Create milestone
- `PATCH /api/projects/:id/milestones/:milestoneId` - Update milestone

### Files
- `POST /api/projects/:id/files` - Upload file
- `DELETE /api/projects/:id/files/:fileId` - Delete file

### Messages
- `POST /api/projects/:id/messages` - Send message

## Deployment to Azure

### Prerequisites
- Azure subscription
- Azure CLI installed
- GitHub account
- Node.js 20+

### Deploy with GitHub Actions

1. **Fork this repository**

2. **Create Azure resources:**
   ```bash
   az group create --name hivecraft-rg --location eastus2
   ```

3. **Set up GitHub secrets:**
   - `AZURE_CLIENT_ID`
   - `AZURE_TENANT_ID`
   - `AZURE_SUBSCRIPTION_ID`
   - `SQL_ADMIN_PASSWORD`
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - `DATABASE_URL` (for migrations)

4. **Push to main branch** - CI/CD pipeline runs automatically

### Deploy with Azure Developer CLI (azd)

```bash
# Login to Azure
azd auth login

# Initialize environment
azd init

# Deploy infrastructure and application
azd up

# View deployed application
azd show
```

### Manual Deployment

```bash
# Deploy infrastructure
az deployment group create \
  --resource-group hivecraft-rg \
  --template-file azure/infra/infrastructure.bicep \
  --parameters envName=prod sqlAdminPassword=YourPassword123!

# Build frontend
npm run build

# Deploy to App Service (backend)
az webapp up --name <app-service-name> --runtime "NODE|20-lts"

# Deploy to Static Web Apps (frontend)
az staticwebapp create \
  --name <static-web-app-name> \
  --resource-group hivecraft-rg \
  --source client \
  --output-location dist
```

## Environment Variables

See `.env.example` for all required variables. Critical ones:

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - 32-byte random key
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `AZURE_STORAGE_ACCOUNT_NAME` / `AZURE_STORAGE_ACCOUNT_KEY` - Blob storage
- `ACS_CONNECTION_STRING` / `ACS_PHONE_NUMBER` - SMS verification (optional)

## Security

**Critical**: Client isolation is enforced at the application level.
- Clients can ONLY see their own projects (`clientMemberId` filter)
- Staff roles are verified via `member_roles` table
- All API routes check permissions before returning data

## Documentation

- **Architecture**: `docs/ARCHITECTURE.md` - System design and data flows
- **Workflow**: `docs/WORKFLOW.md` - How to develop, test, deploy
- **Changelog**: `docs/CHANGELOG.md` - History of changes
- **Tasks**: `docs/TASKS.md` - What's done, what's next
- **Wix Migration**: `docs/wix-studio-migration/README.md` - Transfer guide

## Design

- **Theme**: Dark mode primary (#141414)
- **Accent**: Gold (#f4b41a)
- **Fonts**: Montserrat, Inter, JetBrains Mono
- **See**: `design_guidelines.md` for full spec

## Contributing

1. Read `docs/ARCHITECTURE.md` to understand the system
2. Check `docs/TASKS.md` for available work
3. Follow patterns in existing code
4. Update documentation with your changes
5. Test client isolation before submitting

## License

Proprietary - HiveCraft Digital
