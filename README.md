# ELN Box - Electronic Lab Notebook

An Electronic Lab Notebook system powered by **Box** (storage) and **Vercel** (frontend). All data is stored in Box using folders for hierarchy and metadata templates for structured data. No separate database needed.

## Architecture

- **Box**: Single source of truth for all data (files, folders, metadata)
- **Vercel**: Next.js app with serverless API routes
- **No Database**: Box metadata templates store structured data

## Features

- ✅ Hierarchical organization (Projects → Experiments → Entries)
- ✅ All data stored in Box
- ✅ Native Box versioning and permissions
- ✅ Markdown-based lab entries
- ✅ File attachments (images, data files, reports)
- ✅ Digital signatures and compliance tracking
- ✅ Real-time webhooks from Box

## Prerequisites

1. **Box Enterprise Account** with admin access
2. **Box Custom App** with JWT authentication
3. **Node.js** 18+ and npm
4. **Vercel Account** (for deployment)

## Setup Instructions

### 1. Create Box Custom App

1. Go to [Box Developer Console](https://app.box.com/developers/console)
2. Click "Create New App" → "Custom App" → "Server Authentication (with JWT)"
3. Name your app (e.g., "ELN-App")
4. Enable these scopes:
   - ✅ Read and write all files and folders
   - ✅ Manage users
   - ✅ Manage enterprise properties (for metadata templates)
   - ✅ Manage webhooks
5. Generate RSA keypair and download JSON config
6. Go to Box Admin Console → Apps → Authorize your app (using Client ID)

### 2. Create Box Folder Structure

1. In Box, create root folder: `/ELN-Root`
2. Inside `/ELN-Root`, create subfolder: `/Projects`
3. Note the folder IDs (visible in URL when viewing folder)

### 3. Create Box Metadata Templates

Run the setup script to create metadata templates:

```bash
cd eln-box
npm install
npm run setup-box-templates
```

This creates three metadata templates:
- `projectMetadata` (for project folders)
- `experimentMetadata` (for experiment folders)
- `entryMetadata` (for entry files)

### 4. Configure Environment Variables

Copy the example env file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your Box credentials from the downloaded JSON config:

```bash
BOX_CLIENT_ID=...
BOX_CLIENT_SECRET=...
BOX_ENTERPRISE_ID=...
BOX_PUBLIC_KEY_ID=...
BOX_PRIVATE_KEY="-----BEGIN ENCRYPTED PRIVATE KEY-----\n...\n-----END ENCRYPTED PRIVATE KEY-----"
BOX_PASSPHRASE=...
BOX_ROOT_FOLDER_ID=123456789
BOX_PROJECTS_FOLDER_ID=987654321
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
eln-box/
├── app/
│   ├── api/                    # API routes
│   │   ├── projects/          # Project CRUD
│   │   ├── experiments/       # Experiment CRUD
│   │   └── entries/           # Entry CRUD
│   ├── projects/              # Project pages
│   ├── experiments/           # Experiment pages
│   └── layout.tsx             # Root layout
├── lib/
│   └── box/                   # Box SDK wrappers
│       ├── client.ts          # Box client setup
│       ├── folders.ts         # Folder operations
│       ├── files.ts           # File operations
│       └── types.ts           # TypeScript types
├── scripts/
│   └── setup-box-templates.ts # Metadata template creation
└── .env.local                 # Environment variables
```

## Usage

### Create a Project

1. Navigate to /projects
2. Click "+ New Project"
3. Fill in project details:
   - Project Code (e.g., PROJ-001)
   - Project Name
   - PI Name & Email
   - Department
   - Description
4. Click "Create" → Creates folder in Box with metadata

### Create an Experiment

1. Open a project
2. Click "+ New Experiment"
3. Fill in experiment details:
   - Experiment ID (e.g., EXP-2024-001)
   - Title
   - Objective
   - Hypothesis
   - Tags
4. Click "Create" → Creates experiment folder structure

### Create an Entry

1. Open an experiment
2. Click "+ New Entry"
3. Write your entry in Markdown
4. Attach files (images, data files, etc.)
5. Save → Creates .md file in Box with metadata

## Box Folder Structure

```
/ELN-Root
  /Projects
    /PROJ-001-Protein-Synthesis
      metadata: projectMetadata
      /Experiments
        /EXP-2024-001-Initial-Synthesis
          metadata: experimentMetadata
          /Entries
            /Entry-2024-01-15-Synthesis-Protocol.md
              metadata: entryMetadata
          /Attachments
            /Raw-Data
            /Images
            /Reports
```

## Deployment to Vercel

1. Push code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-org/eln-box.git
git push -u origin main
```

2. Go to [Vercel](https://vercel.com/new)
3. Import your GitHub repository
4. Add environment variables (all BOX_* variables from .env.local)
5. Deploy

6. Update Box webhook URL to point to your Vercel domain:
   - `https://your-app.vercel.app/api/webhooks/box`

## API Endpoints

### Projects

- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:folderId` - Get project details
- `PATCH /api/projects/:folderId` - Update project
- `GET /api/projects/:folderId/experiments` - List experiments in project

### Experiments

- `GET /api/experiments/:folderId` - Get experiment details
- `PATCH /api/experiments/:folderId` - Update experiment
- `GET /api/experiments/:folderId/entries` - List entries in experiment

### Entries

- `GET /api/entries/:fileId` - Get entry with content
- `PATCH /api/entries/:fileId` - Update entry
- `DELETE /api/entries/:fileId` - Delete entry

## License

MIT
