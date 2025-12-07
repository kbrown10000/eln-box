# LabNoteX - Electronic Lab Notebook

A modern Electronic Lab Notebook system for scientific research, built with **Next.js 15**, **Box** (file storage), and **Neon Postgres** (structured data). Deployed on **Vercel**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)

## Live Demo

**Production:** https://eln-box.vercel.app

## Overview

LabNoteX provides researchers with a comprehensive platform for:

- **Project Management** - Organize research into projects with metadata
- **Experiment Tracking** - Document experiments with protocols, reagents, and yields
- **Spectroscopy Data** - Capture and annotate IR, NMR, MS, and UV-Vis spectra
- **File Storage** - Securely store all files in Box with version control
- **Analytics Dashboard** - Visualize research progress and metrics

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel (Next.js 15)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  NextAuth   │  │   API       │  │   React UI          │  │
│  │  (Box OAuth)│  │   Routes    │  │   (Scientific Data) │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────┐  ┌─────────────┐  ┌─────────────────────┐
│  Box (Files)    │  │   Neon      │  │  Box (Files)        │
│  - Folders      │  │   Postgres  │  │  - PDFs, Images     │
│  - Permissions  │  │   (Data)    │  │  - Spectra files    │
│  - Attachments  │  │             │  │  - Documents        │
└─────────────────┘  └─────────────┘  └─────────────────────┘
```

**Data Split:**
- **Box** = File storage, folder hierarchy, permissions, version control
- **Postgres** = Structured scientific data (protocols, reagents, yields, spectra metadata)

## Features

### Authentication
- Box OAuth 2.0 via NextAuth.js v5
- Secure session management
- User profile from Box account

### Projects
- Create and manage research projects
- Track PI, department, and status
- Automatic Box folder creation

### Experiments
- Detailed experiment documentation
- Protocol step editor (add, reorder, delete)
- Reagents table with molar calculations
- Yield calculator (theoretical vs actual)
- Status tracking (draft, in-progress, completed, locked)

### Spectroscopy
- Support for IR, NMR, MS, UV-Vis spectra
- Caption and annotation system
- Peak data storage (JSON)
- Link to Box files

### File Management
- **Native Box Experience** - Full Box Content Explorer embedded directly in the app
- **Project Hubs** - Centralized view of all project content
- **Seamless Uploads** - Drag-and-drop file uploads
- **Rich Previews** - Instant preview of scientific data and documents without downloading

### Analytics Dashboard
- Overview metrics (projects, experiments, researchers)
- Experiment status distribution
- Yield performance tracking
- Spectra by type breakdown
- Most used reagents

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 15](https://nextjs.org) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | Styling |
| [NextAuth.js v5](https://authjs.dev) | Authentication |
| [Drizzle ORM](https://orm.drizzle.team) | Database ORM |
| [Neon Postgres](https://neon.tech) | Serverless database |
| [Box SDK & UI Elements](https://developer.box.com) | File storage & Native Widgets |
| [Vercel](https://vercel.com) | Deployment platform |

## Quick Start

### Prerequisites

- Node.js 18+
- Box Developer Account
- Neon Postgres Database
- Vercel Account (for deployment)

### 1. Clone and Install

```bash
git clone https://github.com/kbrown10000/eln-box.git
cd eln-box
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Fill in your credentials (see [SETUP.md](./SETUP.md) for detailed instructions):

```bash
# Database
POSTGRES_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Box OAuth (User Authentication)
BOX_OAUTH_CLIENT_ID=...
BOX_OAUTH_CLIENT_SECRET=...

# Box JWT (Service Account)
BOX_CLIENT_ID=...
BOX_CLIENT_SECRET=...
BOX_ENTERPRISE_ID=...
BOX_PUBLIC_KEY_ID=...
BOX_PRIVATE_KEY="-----BEGIN ENCRYPTED PRIVATE KEY-----..."
BOX_PASSPHRASE=...
BOX_ROOT_FOLDER_ID=...
BOX_PROJECTS_FOLDER_ID=...
```

### 3. Set Up Database

```bash
POSTGRES_URL="your-connection-string" npx drizzle-kit push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
eln-box/
├── app/
│   ├── api/                      # API Routes
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── projects/             # Project CRUD
│   │   ├── experiments/          # Experiment CRUD
│   │   ├── experiment-data/      # Scientific data CRUD
│   │   ├── dashboard/            # Analytics endpoints
│   │   └── box/                  # Box file operations
│   ├── components/               # React components
│   │   ├── dashboard/            # Dashboard components
│   │   ├── experiment/           # Experiment UI components
│   │   └── ui/                   # Shared UI components
│   ├── projects/                 # Project pages
│   ├── experiments/              # Experiment pages
│   ├── dashboard/                # Dashboard page
│   └── login/                    # Login page
├── lib/
│   ├── auth/                     # Auth configuration
│   ├── box/                      # Box SDK wrappers
│   └── db/                       # Database schema & client
├── scripts/                      # Setup & seed scripts
└── public/                       # Static assets
```

## Documentation

- [SETUP.md](./SETUP.md) - Detailed installation guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and data flow
- [API.md](./API.md) - API endpoint reference
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guidelines

## Scripts

```bash
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run setup-box-folders      # Create Box folder structure
npm run setup-box-templates    # Create Box metadata templates
```

## Database Schema

| Table | Description |
|-------|-------------|
| `users` | User profiles (linked to Box accounts) |
| `projects` | Research projects (linked to Box folders) |
| `experiments` | Experiment records |
| `protocol_steps` | Step-by-step protocols |
| `reagents` | Chemicals and materials used |
| `yields` | Product yield calculations |
| `spectra` | Spectroscopy data and metadata |
| `audit_log` | Activity tracking |
| `files_cache` | Box file metadata cache |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Set these in Vercel dashboard:
- All `BOX_*` variables
- `POSTGRES_URL` from Neon
- `NEXTAUTH_URL` = your production URL
- `NEXTAUTH_SECRET` = secure random string

## Security

- Box OAuth 2.0 for user authentication
- JWT service account for server operations
- All API routes protected with `requireApiAuth()`
- Session tokens encrypted and httpOnly
- Environment variables validated at startup

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.
