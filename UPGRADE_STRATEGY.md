# USDM Box-Centric ELN: Strategic Upgrade Plan

## Executive Summary
Transform the current LabNoteX prototype into an enterprise-grade, GxP-compliant, AI-enabled Life Sciences platform. The goal is to move beyond a simple "Notebook" to a **Content-Driven Process Engine** that leverages Box as the single source of truth and Vercel/Next.js for intelligent workflow orchestration.

## Strategic Pillars

### 1. Intelligent Automation (AI Agents)
**Goal:** Reduce manual data entry and increase scientific throughput.
*   **"Ingest Agents":** Listen for file uploads in Box (e.g., Instrument PDFs, Images). Automatically parse them using **Gemini Multimodal (via Vercel AI SDK)** to extract structured data (yields, peaks, parameters) and populate the Postgres database.
*   **"Compliance Agents":** Auto-scan protocols against SOPs stored in Box to flag deviations before an experiment starts.
*   **"Insight Agents":** Generate natural language summaries of experiment results for "Lab to Launch" reports.

### 2. Deep GxP Compliance & Validation
**Goal:** Ensure 21 CFR Part 11 readiness and data integrity.
*   **Unified Audit Trail:** A centralized audit log in Postgres that captures *both* database changes (Drizzle history) and Box file events (via Webhooks).
*   **Digital Signatures:** Integration with **Box Sign** or a custom 21 CFR Part 11 compliant e-signature flow (Review -> Approve -> Lock).
*   **Chain of Custody:** Strict tracking of sample/reagent usage linked to specific experiment versions.

### 3. Advanced Workflow Orchestration
**Goal:** Enforce rigorous scientific processes.
*   **State Machine:** Formalize experiment states (`Draft` -> `In Review` -> `Approved` -> `In Progress` -> `Completed` -> `Locked`).
*   **Gatekeeping:** Prevent state transitions until criteria are met (e.g., "Cannot move to 'Approved' without PI Signature").
*   **Notifications:** Email/Slack alerts via Vercel Functions when an experiment requires review.

### 4. Enterprise Integration Hub
**Goal:** Connect the lab to the business.
*   **Box Webhooks:** Real-time synchronization. When a file changes in Box, the App updates instantly.
*   **Metadata Sync:** Bidirectional sync between Box Metadata Templates and Postgres tables.

---

## Technical Architecture Upgrades

| Component | Current State | Target State |
|-----------|---------------|--------------|
| **AI** | None | **Vercel AI SDK** + Gemini Multimodal integration |
| **Box Integration** | Passive (User triggered) | **Active (Webhooks)** + Event-driven architecture |
| **Database** | Basic CRUD | **Unified Audit Architecture** (Utilizing existing Schema + Middleware) |
| **Authentication** | Basic OAuth | **RBAC** (Role-Based Access Control) with granular permissions |
| **Validation** | None | **Foundational Automated Testing** (Playwright from Phase 1) |

## User Experience (UX) Evolution
*   **Dashboard 2.0:** Personalized views for PIs (Review Queue) vs. Scientists (Active Experiments).
*   **Smart Search:** RAG (Retrieval-Augmented Generation) search that queries *both* structured DB data and unstructured Box content.
