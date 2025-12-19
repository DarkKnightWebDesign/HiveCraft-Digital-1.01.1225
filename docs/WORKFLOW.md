# HiveCraft Digital - Workflow Guide

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database (auto-provisioned on Replit)

### Running Locally

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app runs on **port 5000** with hot reload enabled.

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (frontend + backend) |
| `npm run db:push` | Push schema changes to database |
| `npm run build` | Build for production |
| `npm run start` | Run production build |

## Environment Variables

### Required
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (auto-set on Replit) |
| `SESSION_SECRET` | Secret for session encryption |
| `REPLIT_DOMAINS` | Allowed domains for auth (auto-set) |

### Auto-Provisioned by Replit
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
- `ISSUER_URL` (for Replit Auth)

## Project Structure for Development

### Adding a New Page

1. Create component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Add navigation link if needed

### Adding an API Endpoint

1. Add route in `server/routes.ts`
2. Add storage method in `server/storage.ts`
3. Update schema if needed in `shared/schema.ts`

### Modifying Database Schema

1. Edit `shared/schema.ts`
2. Run `npm run db:push`
3. Update storage interface if needed

## Testing

### Manual Testing
1. Start dev server: `npm run dev`
2. Open browser to port 5000
3. Test public pages without auth
4. Login via Replit Auth to test portal

### Testing Client Isolation
1. Create two test client accounts
2. Create projects for each
3. Verify Client A cannot see Client B's projects

### Testing Staff Access
1. Add staff role to test account via database
2. Verify access to `/admin` routes
3. Verify can see all projects

## Deployment

### On Replit
1. Click "Publish" button
2. App deploys automatically
3. SSL handled by Replit

### Custom Domain
1. Go to Replit project settings
2. Add custom domain
3. Configure DNS as instructed

## Common Tasks

### Add a User as Staff
```sql
INSERT INTO member_roles (user_id, role)
VALUES ('user-id-here', 'admin');
```

### Create a Test Project
```sql
INSERT INTO projects (client_member_id, title, type, tier, status, progress_percent)
VALUES ('client-user-id', 'Test Project', 'managed_website', 'growth', 'design', 25);
```

### Check User Role
```sql
SELECT * FROM member_roles WHERE user_id = 'user-id-here';
```

## Debugging

### Check Server Logs
- View workflow logs in Replit console
- Look for Express request logs

### Check Database
- Use Replit's database panel
- Or run SQL queries via `execute_sql_tool`

### Common Issues

| Issue | Solution |
|-------|----------|
| 401 on all requests | Check session cookie, verify auth setup |
| Can't see projects | Verify clientMemberId matches user |
| Schema changes not applied | Run `npm run db:push` |
| Styles not updating | Clear browser cache, restart Vite |

## Code Style

- Use TypeScript for all new code
- Follow existing patterns in codebase
- Use shadcn/ui components
- Add `data-testid` attributes to interactive elements
- Keep components small and focused
