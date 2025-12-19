# HiveCraft Digital Platform

A comprehensive web design and development agency platform with marketing website, client portal, and staff back office.

## What This Project Is

HiveCraft Digital is a full-stack platform for a web design agency featuring:

- **Marketing Website** - 7 public pages showcasing services, process, pricing, and portfolio
- **Client Portal** - Authenticated area where clients track their projects, view previews, send messages
- **Staff Back Office** - Admin dashboard for team members to manage all client projects

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 + TypeScript | Frontend framework |
| Vite | Build tool and dev server |
| wouter | Client-side routing |
| TanStack Query | Server state management |
| shadcn/ui | UI component library |
| Tailwind CSS | Styling |
| Express.js | Backend API |
| PostgreSQL | Database |
| Drizzle ORM | Database queries |
| Replit Auth | Authentication |

## How to Run

```bash
# Install dependencies
npm install

# Push database schema (first time only)
npm run db:push

# Start development server
npm run dev
```

The app runs on **port 5000**.

## Where to Start Reading the Code

| File | Purpose |
|------|---------|
| `shared/schema.ts` | **Start here** - Database schema and TypeScript types |
| `server/routes.ts` | All API endpoints |
| `server/storage.ts` | Database operations |
| `client/src/App.tsx` | Frontend routes and providers |
| `client/src/index.css` | Theme variables and custom styles |

## Project Structure

```
├── client/src/
│   ├── components/    # UI components (marketing, portal, shadcn)
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   └── lib/           # Utilities
├── server/
│   ├── routes.ts      # API endpoints
│   ├── storage.ts     # Database layer
│   └── auth.ts        # Authentication
├── shared/
│   └── schema.ts      # Database schema (single source of truth)
└── docs/
    ├── ARCHITECTURE.md    # System architecture
    ├── WORKFLOW.md        # Development workflow
    ├── CHANGELOG.md       # Change history
    ├── TASKS.md           # Current TODOs
    └── wix-studio-migration/  # Wix transfer guide
```

## Key Features

### Marketing Website
- Home page with hero section
- Services grid
- 5-stage process timeline
- 3-tier pricing table
- Portfolio showcase
- About page
- Contact form

### Client Portal
- Project dashboard with cards
- Project detail with 6 tabs:
  - Overview (progress, team, quick actions)
  - Timeline (milestones)
  - Previews (approve/reject staging links)
  - Files (uploads)
  - Messages (communication)
  - Billing (invoices)

### Staff Back Office
- Admin dashboard with stats
- All projects view
- Create new projects
- Manage milestones
- Post previews

## Security

**Critical**: Client isolation is enforced at the database level.

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
