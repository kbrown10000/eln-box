# LabNoteX Architecture

This document describes the system architecture, data flow, and design decisions for LabNoteX.

## System Overview

LabNoteX uses a hybrid architecture combining:
- **Box** for file storage and access control
- **Neon Postgres** for structured scientific data
- **Next.js 15** for the frontend and API layer
- **Vercel** for serverless deployment

```
                                    ┌──────────────────┐
                                    │     User         │
                                    │   (Browser)      │
                                    └────────┬─────────┘
                                             │
                                             ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              Vercel Edge Network                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         Next.js 15 Application                        │  │
│  │                                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Pages     │  │   API       │  │  Server     │  │  NextAuth   │  │  │
│  │  │   (RSC)     │  │   Routes    │  │  Actions    │  │  (Auth)     │  │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │  │
│  │         │                │                │                │         │  │
│  │         └────────────────┴────────────────┴────────────────┘         │  │
│  │                                   │                                   │  │
│  │                    ┌──────────────┴──────────────┐                   │  │
│  │                    ▼                             ▼                   │  │
│  │         ┌─────────────────┐           ┌─────────────────┐            │  │
│  │         │   Drizzle ORM   │           │   Box SDK       │            │  │
│  │         │   (Database)    │           │   (Files)       │            │  │
│  │         └────────┬────────┘           └────────┬────────┘            │  │
│  └──────────────────┼────────────────────────────┼──────────────────────┘  │
└─────────────────────┼────────────────────────────┼─────────────────────────┘
                      │                            │
                      ▼                            ▼
           ┌─────────────────┐          ┌─────────────────┐
           │  Neon Postgres  │          │   Box Cloud     │
           │  (Serverless)   │          │   (Storage)     │
           │                 │          │                 │
           │  - Users        │          │  - Projects/    │
           │  - Experiments  │          │  - Experiments/ │
           │  - Protocols    │          │  - Files        │
           │  - Reagents     │          │  - Permissions  │
           │  - Yields       │          │                 │
           │  - Spectra      │          │                 │
           └─────────────────┘          └─────────────────┘
```

## Data Split Strategy

### Why Two Data Stores?

| Requirement | Box | Postgres |
|-------------|-----|----------|
| File versioning | Yes | No |
| Complex queries | No | Yes |
| File permissions | Yes | Limited |
| Structured data | Metadata only | Full SQL |
| File preview | Yes | No |
| Relationships | No | Yes |

**Decision:** Use each system for what it does best.

### Box Responsibilities

1. **Folder Hierarchy**
   - `/ELN-Root/Projects/` - Parent folder for all projects
   - Each project = Box folder with metadata
   - Each experiment = subfolder under project

2. **File Storage**
   - Raw data files
   - Spectra images
   - PDF reports
   - Lab notebook scans

3. **Access Control**
   - Folder-level permissions
   - Share links
   - Enterprise compliance

4. **Versioning**
   - Automatic file versions
   - Audit trail built-in

### Postgres Responsibilities

1. **Structured Scientific Data**
   - Protocol steps (ordered)
   - Reagents with calculations
   - Yield measurements
   - Spectra metadata

2. **User Management**
   - User profiles
   - Roles (admin, PI, researcher, viewer)
   - Session data

3. **Analytics**
   - Aggregations
   - Status counts
   - Yield statistics

4. **Audit Logging**
   - Who did what, when
   - Entity change tracking

## Database Schema

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   users     │     │  projects   │     │   experiments   │
├─────────────┤     ├─────────────┤     ├─────────────────┤
│ id (PK)     │◄────│ created_by  │     │ id (PK)         │
│ box_user_id │     │ id (PK)     │◄────│ project_id (FK) │
│ email       │     │ box_folder  │     │ box_folder_id   │
│ name        │     │ project_code│     │ experiment_id   │
│ role        │     │ project_name│     │ title           │
│ avatar_url  │     │ description │     │ objective       │
│ created_at  │     │ pi_name     │     │ hypothesis      │
└─────────────┘     │ pi_email    │     │ status          │
                    │ department  │     │ author_id (FK)  │
                    │ status      │     │ started_at      │
                    │ created_at  │     │ completed_at    │
                    └─────────────┘     └────────┬────────┘
                                                 │
                    ┌────────────────────────────┼────────────────────────────┐
                    │                            │                            │
                    ▼                            ▼                            ▼
          ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
          │ protocol_steps  │         │    reagents     │         │     yields      │
          ├─────────────────┤         ├─────────────────┤         ├─────────────────┤
          │ id (PK)         │         │ id (PK)         │         │ id (PK)         │
          │ experiment_id   │         │ experiment_id   │         │ experiment_id   │
          │ step_number     │         │ name            │         │ product_name    │
          │ instruction     │         │ amount          │         │ theoretical     │
          │ notes           │         │ unit            │         │ actual          │
          └─────────────────┘         │ molar_amount    │         │ percentage      │
                                      │ observations    │         │ unit            │
                    ▼                 └─────────────────┘         └─────────────────┘
          ┌─────────────────┐
          │    spectra      │
          ├─────────────────┤
          │ id (PK)         │
          │ experiment_id   │
          │ box_file_id     │
          │ spectrum_type   │
          │ title           │
          │ caption         │
          │ peak_data (JSON)│
          └─────────────────┘
```

### Foreign Key Relationships

- `projects.created_by_id` → `users.id`
- `experiments.project_id` → `projects.id`
- `experiments.author_id` → `users.id`
- `protocol_steps.experiment_id` → `experiments.id` (CASCADE DELETE)
- `reagents.experiment_id` → `experiments.id` (CASCADE DELETE)
- `yields.experiment_id` → `experiments.id` (CASCADE DELETE)
- `spectra.experiment_id` → `experiments.id` (CASCADE DELETE)

## Authentication Flow

```
┌──────────┐     ┌───────────┐     ┌─────────┐     ┌──────────┐
│  User    │     │  NextAuth │     │  Box    │     │ Postgres │
│ Browser  │     │  Handler  │     │  OAuth  │     │  (Users) │
└────┬─────┘     └─────┬─────┘     └────┬────┘     └────┬─────┘
     │                 │                │               │
     │  1. Click Login │                │               │
     │────────────────►│                │               │
     │                 │                │               │
     │  2. Redirect to │                │               │
     │◄────────────────│                │               │
     │                 │                │               │
     │  3. Login at Box.com            │               │
     │─────────────────────────────────►│               │
     │                 │                │               │
     │  4. Authorization Code          │               │
     │◄─────────────────────────────────│               │
     │                 │                │               │
     │  5. Code + Redirect             │               │
     │────────────────►│                │               │
     │                 │                │               │
     │                 │  6. Exchange Code              │
     │                 │───────────────►│               │
     │                 │                │               │
     │                 │  7. Access Token               │
     │                 │◄───────────────│               │
     │                 │                │               │
     │                 │  8. Get User Info              │
     │                 │───────────────►│               │
     │                 │                │               │
     │                 │  9. User Profile               │
     │                 │◄───────────────│               │
     │                 │                │               │
     │                 │  10. Upsert User               │
     │                 │───────────────────────────────►│
     │                 │                │               │
     │  11. Session Cookie             │               │
     │◄────────────────│                │               │
     │                 │                │               │
```

### Two Box Apps Required

1. **OAuth App** (User Authentication)
   - Type: Custom App → User Authentication (OAuth 2.0)
   - Used for: Login, user identity
   - Tokens: Short-lived, per-user

2. **JWT App** (Service Account)
   - Type: Custom App → Server Authentication (JWT)
   - Used for: Folder creation, file operations
   - Tokens: Service account, enterprise-level

## API Architecture

### Route Structure

```
/api
├── /auth/[...nextauth]     # NextAuth.js handler
│
├── /projects               # Project management
│   ├── GET                 # List projects
│   ├── POST                # Create project
│   └── /[folderId]
│       ├── GET             # Get project
│       ├── PATCH           # Update project
│       └── /experiments
│           ├── GET         # List experiments
│           └── POST        # Create experiment
│
├── /experiments/[folderId] # Experiment management
│   ├── GET                 # Get experiment
│   └── PATCH               # Update experiment
│
├── /experiment-data/[boxFolderId]  # Scientific data
│   ├── GET                 # Get all experiment data
│   ├── /protocol
│   │   ├── GET/POST        # Protocol steps
│   │   └── /[stepId]       # Update/delete step
│   ├── /reagents
│   │   ├── GET/POST        # Reagents
│   │   └── /[reagentId]    # Update/delete reagent
│   ├── /yields
│   │   ├── GET/POST        # Yields
│   │   └── /[yieldId]      # Update/delete yield
│   └── /spectra
│       ├── GET/POST        # Spectra
│       └── /[spectrumId]   # Update/delete spectrum
│
├── /dashboard/stats        # Analytics
│   └── GET                 # Dashboard statistics
│
└── /box/folders/[folderId] # Box operations
    └── /items
        └── GET             # List folder contents
```

### Authentication Middleware

All API routes use `requireApiAuth()`:

```typescript
export async function GET(request: NextRequest) {
  const { session, error } = await requireApiAuth();
  if (error) return error;  // 401 Unauthorized

  // session.user contains authenticated user
  // ... handle request
}
```

## Component Architecture

### Page Types

1. **Server Components** (default)
   - Fetch data at request time
   - No client-side JavaScript
   - Examples: `projects/page.tsx`, `experiments/[folderId]/page.tsx`

2. **Client Components** (`'use client'`)
   - Interactive UI
   - useState, useEffect hooks
   - Examples: `ExperimentClient.tsx`, `DashboardClient.tsx`

### Component Hierarchy

```
app/experiments/[folderId]/page.tsx (Server)
└── ExperimentClient.tsx (Client)
    ├── ExperimentHeader.tsx
    ├── ProtocolEditor.tsx
    ├── ReagentsTable.tsx
    ├── YieldCalculator.tsx
    ├── SpectroscopySection.tsx
    └── BoxFileBrowser.tsx
        └── BoxHub.tsx (Box Content Explorer)
```

### Box UI Integration (The "Box Experience")

To provide a native file management experience, LabNoteX integrates official Box UI Elements (Content Explorer, Preview, etc.) directly into the application.

1.  **BoxClientProvider**: A global React Context provider (`app/components/box/BoxClientProvider.tsx`) loads the Box UI SDK scripts (CSS/JS) once at the application root. This prevents race conditions and ensures widgets load instantly on navigation.
2.  **BoxHub**: A wrapper component (`app/components/box/BoxHub.tsx`) that initializes the **Box Content Explorer**.
    *   **Project Hubs**: Display the full content of a Project folder.
    *   **Experiment Files**: Display the content of an Experiment folder.
    *   **Features**: Enables drag-and-drop uploads, file previews, search, and sidebar details natively.
3.  **Token Exchange**: The frontend requests a "downscoped" access token from `/api/box/token` to authorize the widget.
    *   **Security**: The token endpoint enforces a strict whitelist of scopes (e.g., `item_preview`, `base_explorer`) to prevent privilege escalation.

## Data Flow Examples

### Creating an Experiment

```
1. User fills NewExperimentForm
           │
           ▼
2. POST /api/projects/{projectId}/experiments
           │
           ▼
3. API Route:
   a. Verify auth (requireApiAuth)
   b. Create Box folder (Box SDK)
   c. Apply metadata template
   d. Insert into experiments table (Drizzle)
   e. Return experiment with folderId
           │
           ▼
4. Client redirects to /experiments/{folderId}
```

### Adding a Reagent

```
1. User clicks "Add Reagent" in ExperimentClient
           │
           ▼
2. POST /api/experiment-data/{boxFolderId}/reagents
   Body: { name, amount, unit, molarAmount, observations }
           │
           ▼
3. API Route:
   a. Verify auth
   b. Find experiment by boxFolderId
   c. Insert into reagents table
   d. Return new reagent
           │
           ▼
4. Client adds reagent to local state
```

### Loading Dashboard

```
1. User navigates to /dashboard
           │
           ▼
2. Server component renders DashboardClient
           │
           ▼
3. DashboardClient useEffect:
   GET /api/dashboard/stats
           │
           ▼
4. API Route queries:
   - COUNT experiments by status
   - SELECT recent experiments
   - AVG yield percentage
   - COUNT spectra by type
   - GROUP BY reagents (most used)
           │
           ▼
5. Client renders charts and metrics
```

## Deployment Architecture

### Vercel Configuration

```
┌─────────────────────────────────────────────────────┐
│                    Vercel Project                    │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │             Edge Network (CDN)                │   │
│  │  - Static assets                              │   │
│  │  - ISR pages                                  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │           Serverless Functions                │   │
│  │  - API routes (/api/*)                        │   │
│  │  - Server components                          │   │
│  │  - Auth callbacks                             │   │
│  │                                               │   │
│  │  Environment Variables:                       │   │
│  │  - POSTGRES_URL                               │   │
│  │  - NEXTAUTH_SECRET                            │   │
│  │  - BOX_* credentials                          │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Connection Pooling

Neon Postgres uses connection pooling for serverless:
- Pooler endpoint: `...-pooler.us-east-1.aws.neon.tech`
- Each function invocation gets a pooled connection
- No cold-start connection overhead

## Security Considerations

### Authentication
- Box OAuth for identity
- NextAuth session cookies (httpOnly, secure)
- Token refresh handled automatically

### Authorization
- API routes verify session before processing
- Box folder permissions control file access
- User roles define capabilities (future)

### Data Protection
- HTTPS everywhere (Vercel enforced)
- Database connections over SSL
- Credentials in environment variables only

### Input Validation
- TypeScript for type safety
- Drizzle schema enforces data types
- API routes validate required fields

## Future Considerations

### Potential Enhancements

1. **Real-time Updates**
   - WebSocket or Server-Sent Events
   - Collaborative editing

2. **Box Webhooks**
   - Notify when files change
   - Sync file metadata to cache

3. **Full-text Search**
   - Index experiment content
   - Search protocols and notes

4. **PDF Export**
   - Generate experiment reports
   - Include spectra images

5. **Mobile App**
   - React Native client
   - Camera integration for photos
