# Phased Execution Plan: USDM ELN Upgrade

This plan breaks down the `UPGRADE_STRATEGY.md` into actionable development phases.
**OPTIMIZED STRATEGY:** Focus on *implementation* over schema creation (schema exists), early testing for GxP, and correct AI tooling.

## Phase 1: Foundation, Compliance & Testing (Weeks 1-2)
*Goal: Solidify the data integrity, security posture, and validation framework.*

- [x] **Task 0.5: SDK Migration & Stability (Immediate)**
    - [x] Refactor API routes (`app/api/box/...`) to use new `box-typescript-sdk-gen` methods.
    - [x] Update utility scripts (`setup-demo`, `upload-sample`) to match new SDK patterns.
    - [x] Verify basic file browsing and upload functionality manually.

- [x] **Task 1.0: Validation Infrastructure (Critical)**
    - [x] Install Playwright: `npm init playwright@latest`.
    - [x] Create first E2E test for Login/Auth flow.
    - [x] Configure GitHub Actions for CI testing.

- [x] **Task 1.1: Role-Based Access Control (RBAC)**
    - [x] Update `users` table to include roles (`admin`, `pi`, `researcher`, `viewer`) - *Schema Exists*.
    - [x] Implement middleware to enforce role-based route protection.
    - [x] Create "Admin" settings page for user management.

- [x] **Task 1.2: Unified Audit Log**
    - [x] *Schema Check:* `audit_log` table already exists.
    - [x] Create a reusable `logActivity(userId, action, entityType, entityId, details)` helper function.
    - [x] Instrument server actions (create experiment, update protocol) to call `logActivity`.
    - [x] Build an "Audit Trail" viewer in the Project settings.

- [x] **Task 1.3: Experiment Versioning & Locking**
    - [x] Implement "Lock" functionality: Make DB records read-only when status is `locked`.
    - [x] Implement "Version History" for Protocol steps (snapshotting).

- [x] **Task 1.4: Enterprise Folder Structure (GxP Alignment)**
    - [x] Refactor Box structure to `USDM_ELN` hierarchy (Governance, Projects, Samples, QA/QC).
    - [x] Update `setup-box-structure` script to generate full taxonomy.
    - [x] Update Application Environment to point to new `01_Projects` root.

## Phase 2: Workflow & Orchestration (Weeks 3-4)
*Goal: Turn the app into a process engine that drives scientific rigor.*

- [ ] **Task 2.1: Experiment State Machine**
    - [x] Refactor `status` into a strict state machine (`draft` -> `in-progress` -> `completed` -> `locked`).
    - [x] Add "Submit for Review" action (Scientist -> PI).
    - [x] Add "Approve/Reject" action (PI -> Scientist).

- [x] **Task 2.2: Box Sign Integration (or Custom eSign)**
    - [x] Add "Sign & Close" button to Experiments.
    - [x] Generate a PDF summary of the experiment (Protocol + Results).
    - [x] Upload PDF to Box and trigger a signature request.

- [x] **Task 2.3: Notifications**
    - [x] Create a notification system (in-app + email) for workflow status changes.

## Phase 3: The AI "Lab Assistant" (Weeks 5-6)
*Goal: Introduce intelligent agents to automate manual tasks.*

- [x] **Task 3.1: AI Foundation Setup**
    - [x] Install Vercel AI SDK: `npm install ai @ai-sdk/google`.
    - [x] Configure Gemini API keys in `.env.local`.

- [x] **Task 3.2: "Ingest Agent" (Gemini Multimodal)**
    - [x] Create a feature: "Import from Instrument File".
    - [x] User selects a file (PDF/Image) from Box Hub.
    - [x] **Agent:** Use Gemini 1.5 Pro to read file, extract structured data (yields, peaks), and suggest DB updates.

- [ ] **Task 3.3: "Protocol Assistant"**
    - [ ] Add a "Generate Protocol" button.
    - [ ] User types "Synthesis of Aspirin", Agent generates step-by-step protocol.

## Phase 4: Integration & Scale (Weeks 7-8)
*Goal: Real-time synchronization and enterprise connectivity.*

- [ ] **Task 4.1: Box Webhooks**
    - [ ] Set up a Vercel API route to receive Box Webhook events.
    - [ ] Handle `FILE.UPLOADED`: Auto-link new files to the active experiment in Postgres.

- [ ] **Task 4.2: Metadata Sync**
    - [ ] Ensure that changing `Project Status` in the App updates the **Box Metadata Template** automatically.

- [ ] **Task 4.3: Performance Optimization**
    - [ ] Implement `unstable_cache` for expensive dashboard queries.
    - [ ] Optimize Box API calls with batching.

## Phase 5: Validation & Launch (Week 9)
*Goal: Prove it works.*

- [ ] **Task 5.1: Validation Documentation**
    - [ ] Generate Traceability Matrix (Requirements -> Tests).
    - [ ] Finalize "About" and "Help" documentation.
