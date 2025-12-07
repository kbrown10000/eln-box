# Help and Support for LabNoteX

Welcome to LabNoteX! This document provides guidance on using the application and understanding its key features.

## Getting Started

1.  **Login:** Access the application through your organization's provided URL. You will log in using your Box account credentials.
2.  **Dashboard:** Upon login, you'll see your personalized dashboard with an overview of your projects, recent activities, and key metrics.
3.  **Projects:** Navigate to the "Projects" section to view existing projects or create a new one.

## Core Features

### Projects
Projects are the top-level containers for your experimental work. Each project corresponds to a dedicated folder in Box.

*   **Create Project:** Click the "+ New Project" button. Provide a project code, name, and other relevant details. This will create the project folder in Box and a corresponding record in the application database.
*   **Project Hub:** Within each project, you'll find tabs for "Experiments", "Project Hub" (your Box files), and "Audit Trail".
    *   **Project Hub:** Interact with files directly in Box from within the application. Upload, download, preview, and organize files.

### Experiments
Experiments are nested within projects and represent individual experimental runs or studies.

*   **Create Experiment:** Within a project, navigate to the "Experiments" tab and click "+ New Experiment".
*   **Experiment Workflow (Status):** Experiments follow a strict workflow:
    *   **Draft:** Initial creation, fully editable.
    *   **In Progress:** Work has begun, still editable.
    *   **Review:** Submitted for review by a Principal Investigator (PI) or Admin. Editing is restricted.
    *   **Rejected:** Returned by PI/Admin for revisions. Can be moved back to "In Progress".
    *   **Completed:** Approved by PI/Admin. Data is final, but not yet locked.
    *   **Locked:** The experiment record is immutable. All edits are prevented in the application, and Box folder permissions are restricted to prevent changes to files. This state is typically reached after signing.
*   **Protocol:** Document your experimental steps. You can manually add steps or use the **"Generate Protocol (AI)"** feature to get AI-assisted protocol generation.
*   **Reagents, Yields, Spectroscopy:** Record detailed experimental data in these sections.
*   **Protocol Versions:** Use the "Create Version" button in the Protocol section to save a snapshot of your protocol steps, providing an audit trail for changes.
*   **Sign & Close:** For experiments in "Review" status, PIs/Admins can use "Sign & Close" to generate a PDF report, trigger a Box Sign request for formal electronic signature, and then move the experiment to a "Locked" state.
*   **Import from Instrument File (AI):** In the "Experiment Header" section, you can use AI to extract data from uploaded instrument files (e.g., PDFs of chromatograms, images of gels). The AI will suggest yields, spectra, or reagent data for your review.

### User Management (Admin Only)
Accessible via the User Menu (your avatar) -> "User Management". Admins can view all users and change their roles (Admin, PI, Researcher, Viewer).

### Audit Trail
Available in each Project's tabs, the Audit Trail provides a chronological record of all significant actions performed within that project, including who did what, when, and from where.

### Notifications
The bell icon in the header indicates unread notifications. You'll receive alerts for important events, such as when your experiments are approved or rejected.

## Integration & Compliance
*   **Box as Source of Truth:** All content files (raw data, reports, images) are stored and managed directly in Box, leveraging Box's enterprise-grade security, versioning, and compliance features.
*   **Box Webhooks:** File uploads in Box are automatically detected by the application, ensuring that your `filesCache` is always up-to-date.
*   **AI Assistants:** Leverage Gemini AI for automating data extraction from instrument files and generating experimental protocols, streamlining your research process.
*   **GxP Ready:** The application is designed with GxP (Good Practice) principles in mind, focusing on data integrity, traceability, and workflow control.

## Support
For further assistance, please contact your system administrator or IT support.
