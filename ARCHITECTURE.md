# LabNoteX - Architecture & Box Integration

## Overview
LabNoteX is a specialized Electronic Lab Notebook (ELN) built on a **Hybrid Storage Architecture** that combines the secure, compliant file storage of **Box** with the relational data capabilities of **PostgreSQL**.

This dual-layer approach allows the application to serve as a robust scientific platform while leveraging Box as the "System of Record" for all compliance and file management needs.

---

## Hybrid Architecture

### 1. The Box Layer (System of Record)
Box handles the "Macro" structure and unstructured data.

*   **Folder Structure:**
    *   `/ELN-Root/Projects/{ProjectCode}-{ProjectName}`
    *   `.../Experiments/{ExperimentID}-{ExperimentTitle}`
    *   `.../Attachments/Raw-Data`
    *   `.../LabNoteX KB Content` (Backing folders for Knowledge Base)
*   **Metadata Templates (Enterprise Scope):**
    *   **`projectMetadata`:** Stores high-level project info (Code, PI, Status, Start Date). Allows global search via Box API.
    *   **`experimentMetadata`:** Stores experiment context (Title, Objective, Status, Tags).
    *   **`spectrumMetadata`:** Structured technical metadata for instrument files.
*   **Box Hubs (Knowledge Portal):**
    *   A curated **Box Hub** ("LabNoteX Knowledge Base") acts as a central portal for SOPs, Safety Sheets, and Manuals.
    *   The app interacts with the Hub API to display pinned content, keeping reference material separate from project data.
*   **Security & Compliance:**
    *   All authentication uses **Box JWT (Service Account)** or **OAuth 2.0** (User Impersonation).
    *   Permissions are managed strictly via Box Folder Collaboration roles.

### 2. The PostgreSQL Layer (Application State)
PostgreSQL handles the "Micro" structure and transactional logic.

*   **`experiments` table:** Mirrors the Box folder structure. Linked by `boxFolderId`.
*   **`protocol_steps` table:** Stores ordered, editable steps (`step 1`, `step 2`, `notes`). *Why? Box Metadata does not support complex arrays.*
*   **`reagents` table:** Stores chemical inventory usage (Amount, Units, Moles).
*   **`yields` table:** Stores experimental results and calculations.
*   **`users` table:** Maps application roles to Box User IDs.

---

## Key Data Flows

### Creating a Project
1.  Frontend -> `POST /api/projects`
2.  **Box SDK:** Creates Folder `/ELN-Root/Projects/PROJ-001...`
3.  **Box SDK:** Applies `projectMetadata` template (Project Code, PI).
4.  **DB:** Inserts record into `projects` table (Sync).

### Creating an Experiment
1.  Frontend -> `POST /api/projects/[id]/experiments`
2.  **Box SDK:** Creates Folder `/Experiments/EXP-001...`
3.  **Box SDK:** Applies `experimentMetadata` template.
4.  **DB:** Inserts record into `experiments` table linked by `boxFolderId`. **(Critical for step storage)**

### Generating a Protocol (AI)
1.  User prompts AI ("Synthesize Aspirin").
2.  **Vercel AI SDK (Gemini 1.5 Flash):** Generates structured JSON protocol.
3.  **DB:** Saves steps directly to `protocol_steps` table in Postgres.
4.  **Audit Log:** Records the AI generation event.

### Knowledge Base (Box Hubs)
1.  User creates folders (SOPs, SDS) in Box.
2.  User (or Script) "Pins" these folders to the **Box Hub**.
3.  **App:** `GET /api/knowledge-base` fetches the *Hub Items* list via Box API.
4.  **UI:** Renders the Hub content as a portal. Clicking an item opens the native Box Web App viewer.

---

## Technical Stack

*   **Frontend:** Next.js 15 (App Router), React, Tailwind CSS
*   **Backend:** Next.js Server Actions & API Routes
*   **Database:** PostgreSQL (via Neon/Vercel), Drizzle ORM
*   **Box Integration:** `box-typescript-sdk-gen` (Generated Node.js SDK)
*   **AI:** Google Gemini 1.5 Flash (via Vercel AI SDK)
*   **Authentication:** NextAuth.js (Box Provider)

## Setup & Configuration

### Environment Variables (.env.local)
*   `BOX_CLIENT_ID`, `BOX_CLIENT_SECRET`, `BOX_ENTERPRISE_ID`
*   `BOX_JWT_...` keys for Service Account
*   `BOX_PROJECTS_FOLDER_ID` (Root for projects)
*   `GEMINI_API_KEY`, `GEMINI_MODEL_ID` (Set to `gemini-1.5-flash-latest`)
*   `POSTGRES_URL`

### Key Scripts
*   `npm run setup-box-folders`: Creates root folder structure.
*   `npm run setup-box-templates`: Creates Metadata Templates in Box Enterprise.
*   `npx tsx scripts/setup-box-hubs.ts`: **Hyper-Seed** script that creates the Knowledge Base Hub and populates it with sample content using User Impersonation.
*   `npx tsx scripts/hyper-test.ts`: **Stress Test** script that generates Projects, Experiments, Data, and Files to verify the full Hybrid sync.