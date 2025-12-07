# Validation Document: USDM ELN Upgrade Traceability Matrix

This document provides a traceability matrix mapping implemented features from the Phased Execution Plan to their validation methods, primarily focusing on automated End-to-End (E2E) tests and functional verification points.

## Phase 1: Foundation, Compliance & Testing

### Task 0.5: SDK Migration & Stability
- **Feature:** Refactored API routes (`app/api/box/...`) to use new `box-typescript-sdk-gen` methods.
- **Verification:** Manual verification of basic file browsing and upload.
- **Test Coverage:** Covered by manual verification during development. Future E2E tests for core Box functionality should validate this.

### Task 1.0: Validation Infrastructure
- **Feature:** Installed Playwright, created E2E test for Login/Auth flow, configured GitHub Actions.
- **Verification:** Automated E2E test `tests/auth.spec.ts` runs on CI.
- **Test Coverage:** `tests/auth.spec.ts` covers unauthenticated access and login page rendering.

### Task 1.1: Role-Based Access Control (RBAC)
- **Feature:** Implemented user roles, middleware protection, and Admin UI for user management.
- **Verification:**
    - Manual: Verify admin can access `/admin/users` and modify roles.
    - Manual: Verify non-admin is redirected from `/admin/users`.
- **Test Coverage:** Future E2E tests needed for RBAC roles and page access.

### Task 1.2: Unified Audit Log
- **Feature:** Centralized audit logging for experiment actions (create, update protocol/reagents), Audit Trail viewer.
- **Verification:**
    - Manual: Create an experiment, add/edit protocol steps, check if logs appear in Audit Trail tab.
- **Test Coverage:** Unit/Integration tests for `logActivity` helper. Future E2E tests for Audit Trail content verification.

### Task 1.3: Experiment Versioning & Locking
- **Feature:** Experiment locking (read-only DB records), protocol snapshotting.
- **Verification:**
    - Manual: Set experiment to `locked`, attempt edits, verify failure.
    - Manual: Create protocol snapshot, verify existence in DB.
- **Test Coverage:** Future E2E tests for locked experiment modification attempts and snapshot creation.

### Task 1.4: Enterprise Folder Structure (GxP Alignment)
- **Feature:** Refactored Box folder hierarchy to `USDM_ELN` structure.
- **Verification:**
    - Script output validation.
    - Manual: Verify folder structure in Box UI.
- **Test Coverage:** Covered by `setup-box-folders.ts` script execution.

## Phase 2: Workflow & Orchestration

### Task 2.1: Experiment State Machine
- **Feature:** Defined strict state machine for experiments (`draft` -> `in-progress` -> `review` -> `rejected` -> `completed` -> `locked`), implemented workflow actions (Start, Submit, Approve, Reject, Lock).
- **Verification:**
    - Manual: Progress an experiment through all states with appropriate user roles.
    - Manual: Verify "Deep Locking" in Box by attempting to modify files after locking.
- **Test Coverage:** Unit tests for `updateExperimentStatus` state transitions and permission checks. Future E2E tests for workflow progression.

### Task 2.2: Box Sign Integration
- **Feature:** Generate PDF summary of experiment, upload to Box, trigger Box Sign request.
- **Verification:**
    - Manual: Click "Sign & Close", verify PDF generation and Box Sign request initiation.
- **Test Coverage:** Integration tests for PDF generation and Box Sign API calls.

### Task 2.3: Notifications
- **Feature:** In-app notification system for workflow status changes.
- **Verification:**
    - Manual: Trigger status changes (approve/reject), verify notifications appear in the UI.
- **Test Coverage:** Unit tests for `createNotification`.

## Phase 3: The AI "Lab Assistant"

### Task 3.1: AI Foundation Setup
- **Feature:** Installed Vercel AI SDK, configured Gemini API keys.
- **Verification:** Tool installation success, environment variable presence.
- **Test Coverage:** Development setup.

### Task 3.2: "Ingest Agent" (Gemini Multimodal)
- **Feature:** AI-powered extraction of structured data (yields, spectra, reagents) from instrument files (PDF/Image) selected from Box.
- **Verification:**
    - Manual: Upload a test instrument file, use AI Ingest, verify data extraction and review.
- **Test Coverage:** Integration tests for `ingestInstrumentFile` with mock Box files and Gemini responses.

### Task 3.3: "Protocol Assistant"
- **Feature:** AI-powered generation of step-by-step experiment protocols from text prompts.
- **Verification:**
    - Manual: Provide a prompt, generate protocol, review generated steps.
- **Test Coverage:** Integration tests for `generateProtocol` with various prompts.

## Remaining Phases (Future Work)

### Phase 4: Integration & Scale
- **Task 4.1: Box Webhooks:** Auto-link new files to experiment in Postgres.
  - **Verification:** Manual: Upload file directly to Box folder, verify `filesCache` update.
  - **Test Coverage:** Integration tests for webhook processing and DB updates.
- **Task 4.2: Metadata Sync:** Ensure App changes update Box Metadata Templates.
  - **Verification:** Covered by existing `updateProject` and `updateExperiment` usage.
  - **Test Coverage:** Covered by existing tests (e.g., workflow tests for status).
- **Task 4.3: Performance Optimization:** `unstable_cache` for dashboard queries, Box batching.
  - **Verification:** Performance monitoring, log checks for cache hits.
  - **Test Coverage:** Performance tests.

### Phase 5: Validation & Launch
- **Task 5.1: Validation Documentation:** Generate Traceability Matrix, Finalize "About" and "Help" documentation.
  - **Verification:** Completion of this document.
  - **Test Coverage:** N/A (documentation task).
