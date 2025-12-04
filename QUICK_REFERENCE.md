# ELN Box Quick Reference

## Project Structure

```
eln-box/
├── app/
│   ├── api/                          # API Routes (Next.js)
│   │   ├── projects/route.ts        # GET, POST /api/projects
│   │   ├── projects/[folderId]/
│   │   │   ├── route.ts             # GET, PATCH /api/projects/:id
│   │   │   └── experiments/route.ts # GET, POST experiments
│   │   ├── experiments/[folderId]/
│   │   │   ├── route.ts             # GET, PATCH experiment
│   │   │   └── entries/route.ts     # GET, POST entries
│   │   └── entries/[fileId]/route.ts # GET, PATCH, DELETE entry
│   ├── projects/page.tsx            # Projects list page
│   ├── projects/[folderId]/page.tsx # Project detail page
│   └── page.tsx                     # Home page
├── lib/box/
│   ├── client.ts                    # Box SDK singleton
│   ├── folders.ts                   # Project & experiment operations
│   ├── files.ts                     # Entry operations
│   └── types.ts                     # TypeScript interfaces
├── scripts/
│   └── setup-box-templates.ts       # Metadata template creation
└── .env.local                       # Environment variables (not in git)
```

## Box Folder Structure

```
/ELN-Root (BOX_ROOT_FOLDER_ID)
  /Projects (BOX_PROJECTS_FOLDER_ID)
    /PROJ-001-My-Project
      [metadata: projectMetadata]
      /Experiments
        /EXP-2024-001-Initial-Test
          [metadata: experimentMetadata]
          /Entries
            /Entry-2024-01-15-Synthesis.md
              [metadata: entryMetadata]
          /Attachments
            /Raw-Data
            /Images
            /Reports
```

## API Endpoints

### Projects
```typescript
GET    /api/projects                     // List all projects
POST   /api/projects                     // Create project
GET    /api/projects/:folderId           // Get project
PATCH  /api/projects/:folderId           // Update project
GET    /api/projects/:folderId/experiments // List experiments
```

### Experiments
```typescript
GET    /api/experiments/:folderId        // Get experiment
PATCH  /api/experiments/:folderId        // Update experiment
GET    /api/experiments/:folderId/entries // List entries
POST   /api/experiments/:folderId/entries // Create entry
```

### Entries
```typescript
GET    /api/entries/:fileId              // Get entry (with content)
PATCH  /api/entries/:fileId              // Update entry
DELETE /api/entries/:fileId              // Delete entry
```

## Box Operations

### Create Project
```typescript
import { createProject } from '@/lib/box/folders';

const project = await createProject({
  projectCode: 'PROJ-001',
  projectName: 'My Project',
  piName: 'Dr. Smith',
  piEmail: 'smith@example.com',
  department: 'Chemistry',
  startDate: '2024-01-15',
  status: 'active',
  description: 'Research project description',
});
// Returns: { folderId, ...project data }
```

### List Projects
```typescript
import { listProjects } from '@/lib/box/folders';

const projects = await listProjects();
// Returns: Project[]
```

### Create Experiment
```typescript
import { createExperiment } from '@/lib/box/folders';

const experiment = await createExperiment(projectFolderId, {
  experimentId: 'EXP-2024-001',
  experimentTitle: 'Initial Synthesis',
  objective: 'Synthesize compound X',
  hypothesis: 'Compound X will have property Y',
  ownerName: 'Jane Doe',
  ownerEmail: 'jane@example.com',
  status: 'in-progress',
  tags: ['synthesis', 'analysis'],
});
// Returns: { folderId, ...experiment data }
```

### Create Entry
```typescript
import { createEntry } from '@/lib/box/files';

const entry = await createEntry(
  experimentFolderId,
  {
    entryId: 'entry-123',
    entryDate: '2024-01-15',
    authorName: 'John Smith',
    authorEmail: 'john@example.com',
    title: 'Day 1 Observations',
    entryType: 'observation',
    status: 'draft',
    version: '1',
  },
  '# Day 1\n\nObservations here...' // Markdown content
);
// Returns: { fileId, ...entry data }
```

### Get Entry with Content
```typescript
import { getEntry } from '@/lib/box/files';

const entry = await getEntry(fileId);
// Returns: { fileId, content, ...metadata }
```

### Update Entry
```typescript
import { updateEntry } from '@/lib/box/files';

const entry = await updateEntry(
  fileId,
  '# Updated content\n\nNew observations...', // New content
  { status: 'submitted' } // Metadata updates
);
// Creates new version in Box automatically
```

## TypeScript Types

```typescript
// Project
interface Project {
  folderId: string;
  projectCode: string;
  projectName: string;
  piName: string;
  piEmail: string;
  department: string;
  startDate: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'archived';
  description: string;
}

// Experiment
interface Experiment {
  folderId: string;
  experimentId: string;
  experimentTitle: string;
  objective: string;
  hypothesis: string;
  ownerName: string;
  ownerEmail: string;
  startedAt?: string;
  completedAt?: string;
  status: 'draft' | 'in-progress' | 'completed' | 'locked';
  tags: string[];
}

// Entry
interface Entry {
  fileId: string;
  entryId: string;
  entryDate: string;
  authorName: string;
  authorEmail: string;
  title: string;
  entryType: 'protocol' | 'observation' | 'results' | 'analysis' | 'conclusion';
  status: 'draft' | 'submitted' | 'reviewed' | 'signed' | 'locked';
  version: string;
  signedAt?: string;
  signedBy?: string;
  signatureHash?: string;
  content?: string;
}
```

## Environment Variables

```bash
# Box JWT Config (from Box App JSON config)
BOX_CLIENT_ID=abc123...
BOX_CLIENT_SECRET=xyz789...
BOX_ENTERPRISE_ID=12345
BOX_PUBLIC_KEY_ID=abc123
BOX_PRIVATE_KEY="-----BEGIN ENCRYPTED PRIVATE KEY-----\n...\n-----END ENCRYPTED PRIVATE KEY-----"
BOX_PASSPHRASE=your_passphrase

# Box Folder IDs
BOX_ROOT_FOLDER_ID=123456789
BOX_PROJECTS_FOLDER_ID=987654321

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linter

# Setup
npm install              # Install dependencies
npm run setup-box-templates  # Create Box metadata templates
```

## Box Metadata Templates

### projectMetadata
```json
{
  "projectCode": "string",
  "projectName": "string",
  "piName": "string",
  "piEmail": "string",
  "department": "string",
  "startDate": "date",
  "status": "enum (planning|active|on-hold|completed|archived)",
  "description": "string"
}
```

### experimentMetadata
```json
{
  "experimentId": "string",
  "experimentTitle": "string",
  "objective": "string",
  "hypothesis": "string",
  "ownerName": "string",
  "ownerEmail": "string",
  "startedAt": "date",
  "completedAt": "date",
  "status": "enum (draft|in-progress|completed|locked)",
  "tags": "multiSelect (synthesis|analysis|characterization|purification|validation)"
}
```

### entryMetadata
```json
{
  "entryId": "string",
  "entryDate": "date",
  "authorName": "string",
  "authorEmail": "string",
  "title": "string",
  "entryType": "enum (protocol|observation|results|analysis|conclusion)",
  "status": "enum (draft|submitted|reviewed|signed|locked)",
  "version": "string",
  "signedAt": "date",
  "signedBy": "string",
  "signatureHash": "string"
}
```

## Key Features

### Box as Backend
- ✅ Single source of truth
- ✅ Native versioning (every file update creates new version)
- ✅ Native permissions (Box collaboration model)
- ✅ Native search (metadata + full-text)
- ✅ Audit trail (Box events API)

### Vercel as Frontend
- ✅ Serverless API routes (auto-scaling)
- ✅ Server-side rendering (fast page loads)
- ✅ Edge functions (low latency)
- ✅ Zero-config deployment

### No Database
- ✅ Simplified architecture
- ✅ No DB management/backups
- ✅ Box handles everything
- ✅ Stateless application

## URL Routes

```
/                           # Home page
/projects                   # Projects list
/projects/[folderId]        # Project detail
/experiments/[folderId]     # Experiment detail (add this page!)
```

## Next Steps to Build

### High Priority
1. **New Project Form** - Create UI for `/projects/new`
2. **New Experiment Form** - Create UI for `/projects/[id]/experiments/new`
3. **Entry Editor** - Rich markdown editor component
4. **File Upload** - Drag-and-drop for attachments

### Medium Priority
5. **Authentication** - NextAuth.js with SSO
6. **Edit Forms** - Update project/experiment metadata
7. **Search** - Full-text search across entries
8. **Experiment Page** - Detail view for single experiment

### Low Priority
9. **Digital Signatures** - Signing workflow
10. **PDF Export** - Generate compliance reports
11. **Webhooks** - Real-time updates from Box
12. **Audit Log** - Track all user actions

## Helpful Links

- [Box Node SDK Docs](https://github.com/box/box-node-sdk)
- [Box Developer Console](https://app.box.com/developers/console)
- [Box Admin Console](https://app.box.com/master/settings/apps)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Built with Box + Vercel + Next.js**
