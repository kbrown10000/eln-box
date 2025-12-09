# LabNoteX - Project Documentation

## Architecture
See [ARCHITECTURE.md](./ARCHITECTURE.md) for a deep dive into the Hybrid Box + PostgreSQL design and the Box Hubs integration.

## Core Features
1.  **Project & Experiment Management:**
    *   Projects are Box Folders with `projectMetadata`.
    *   Experiments are sub-folders with `experimentMetadata`.
    *   Granular data (steps, reagents) is stored in PostgreSQL.
2.  **AI Protocol Generation:**
    *   Uses Google Gemini 1.5 Flash to generate scientific protocols.
3.  **Knowledge Base:**
    *   Powered by **Box Hubs**.
    *   Provides a portal for SOPs, SDS, and Manuals.
4.  **Instrument Integration:**
    *   AI-powered ingestion of PDF/Text instrument files.

## Setup
1.  **Install Dependencies:** `npm install`
2.  **Configure Environment:** Copy `.env.local.example` to `.env.local` and fill in Box, Database, and Gemini keys.
3.  **Initialize Box:**
    *   `npm run setup-box-folders` (Root structure)
    *   `npm run setup-box-templates` (Metadata templates)
    *   `npx tsx scripts/setup-box-hubs.ts` (Knowledge Base Hub)
4.  **Run Development Server:** `npm run dev`

## Testing
*   **Hyper-Test:** Run `npx tsx scripts/hyper-test.ts` to simulate a power user creating projects, experiments, files, and data.