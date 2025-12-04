# Getting Started with ELN Box

Welcome to ELN Box! This guide will walk you through setting up and running your Electronic Lab Notebook system.

## What is ELN Box?

ELN Box is a modern Electronic Lab Notebook (ELN) system that uses:
- **Box** as the backend (stores ALL data - files and metadata)
- **Next.js + Vercel** as the frontend (web UI and API)
- **No separate database** - Box metadata templates handle structured data

## Quick Setup (5 Steps)

### Step 1: Create Box Custom App

1. Go to [Box Developer Console](https://app.box.com/developers/console)
2. Click **"Create New App"**
3. Choose **"Custom App"** → **"Server Authentication (with JWT)"**
4. Name it: `ELN-App`
5. Enable these scopes:
   - ✅ Read and write all files and folders
   - ✅ Manage users
   - ✅ Manage enterprise properties
   - ✅ Manage webhooks
6. **Generate RSA keypair**
7. **Download JSON config file** (save it safely!)
8. Copy your **Client ID**

### Step 2: Authorize App in Box Admin Console

1. Go to [Box Admin Console](https://app.box.com/master/settings/apps)
2. Navigate to **Apps** → **Custom Apps**
3. Click **"Authorize New App"**
4. Paste your **Client ID** from Step 1
5. Click **"Authorize"**

### Step 3: Create Box Folder Structure

1. In your Box account, create this folder structure:
   ```
   /ELN-Root
     /Projects
   ```
2. Note the **Folder IDs**:
   - Click on `/ELN-Root` folder → Look at URL → Copy the number (e.g., `https://app.box.com/folder/123456789` → ID is `123456789`)
   - Click on `/Projects` folder → Copy its ID too

### Step 4: Configure Environment Variables

1. Navigate to the project directory:
   ```bash
   cd eln-box
   ```

2. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

3. Open `.env.local` and fill in values from your Box JSON config:

   ```bash
   # From the JSON config file you downloaded:
   BOX_CLIENT_ID=abc123...
   BOX_CLIENT_SECRET=xyz789...
   BOX_ENTERPRISE_ID=12345
   BOX_PUBLIC_KEY_ID=abc123
   BOX_PRIVATE_KEY="-----BEGIN ENCRYPTED PRIVATE KEY-----\n...\n-----END ENCRYPTED PRIVATE KEY-----"
   BOX_PASSPHRASE=your_passphrase

   # Folder IDs you noted in Step 3:
   BOX_ROOT_FOLDER_ID=123456789
   BOX_PROJECTS_FOLDER_ID=987654321

   # Keep this as is for local development:
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   **Important:** For `BOX_PRIVATE_KEY`, copy the entire private key from the JSON config, including the `-----BEGIN ENCRYPTED PRIVATE KEY-----` and `-----END ENCRYPTED PRIVATE KEY-----` lines. Keep the `\n` characters as-is.

### Step 5: Install Dependencies and Setup Box

1. Install all dependencies:
   ```bash
   npm install
   ```

2. Create Box metadata templates:
   ```bash
   npm run setup-box-templates
   ```

   You should see:
   ```
   ✅ projectMetadata template created successfully
   ✅ experimentMetadata template created successfully
   ✅ entryMetadata template created successfully
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to **[http://localhost:3000](http://localhost:3000)**

## Your First Project

1. **Navigate to Projects**
   - Click "Projects" in the top navigation
   - Or go directly to [http://localhost:3000/projects](http://localhost:3000/projects)

2. **Create a New Project**
   - Click "+ New Project" button
   - Fill in:
     - **Project Code**: `PROJ-001`
     - **Project Name**: `Test Project`
     - **PI Name**: Your name
     - **PI Email**: Your email
     - **Department**: Your department
     - **Description**: Brief description
   - Click "Create"

3. **Verify in Box**
   - Go to your Box `/ELN-Root/Projects` folder
   - You should see a new folder: `PROJ-001-Test-Project`
   - Click on it → View metadata (right panel) → You'll see the project metadata!

4. **Create an Experiment**
   - Click on your newly created project
   - Click "+ New Experiment"
   - Fill in:
     - **Experiment ID**: `EXP-2024-001`
     - **Title**: `Initial Test`
     - **Objective**: Your experiment objective
     - **Tags**: Select relevant tags
   - Click "Create"

5. **Create an Entry**
   - Click on your experiment
   - Click "+ New Entry"
   - Write your entry in Markdown:
     ```markdown
     # Day 1: Setup and Initial Observations

     ## Materials
     - Sample A
     - Sample B

     ## Procedure
     1. Prepared solutions
     2. Measured samples
     3. Recorded observations

     ## Results
     Initial results look promising...
     ```
   - Click "Save"

6. **Verify Everything in Box**
   - Go to Box → Your experiment folder
   - You'll see:
     - `/Entries` folder with your markdown file
     - `/Attachments` folder (with subfolders for Raw-Data, Images, Reports)
   - All metadata is attached to the folders/files!

## Understanding the Architecture

### How Data is Stored

**Everything lives in Box:**
- **Folders** = Organizational hierarchy
  - Projects are folders with `projectMetadata`
  - Experiments are folders with `experimentMetadata`
- **Files** = Content
  - Entries are `.md` files with `entryMetadata`
  - Attachments are regular files
- **Metadata Templates** = Structured data
  - Replace traditional database tables
  - Searchable and queryable via Box API

### Vercel App Structure

```
Your Browser
     ↓
Next.js UI (Vercel)
     ↓
API Routes (Vercel serverless)
     ↓
Box SDK
     ↓
Box Platform (source of truth)
```

**No database needed!** All queries go directly to Box.

## Common Tasks

### Adding a File Attachment

1. In an experiment, upload files to:
   - `/Attachments/Raw-Data` - for CSV, Excel, raw instrument data
   - `/Attachments/Images` - for photos, screenshots, graphs
   - `/Attachments/Reports` - for PDF reports, summaries

2. Files are automatically linked to the experiment via the folder structure

### Updating Project Status

1. Open a project
2. Click "Edit" (if you add this feature)
3. Change status: `planning` → `active` → `completed` → `archived`
4. The metadata in Box updates instantly

### Searching Entries

Box's built-in search will find:
- Metadata fields (project code, experiment ID, author email)
- File contents (text in your markdown entries)

## Next Steps

### Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial ELN Box setup"
   git remote add origin https://github.com/YOUR_USERNAME/eln-box.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repo
   - Add all environment variables from `.env.local`
   - Click "Deploy"

3. **Update App URL:**
   - After deployment, update in Vercel environment variables:
     ```
     NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
     ```

### Add More Features

Some ideas to extend the system:
- **User authentication** (NextAuth.js with your org's SSO)
- **Rich text editor** (TipTap, Lexical)
- **File upload UI** (drag-and-drop component)
- **Digital signatures** (implement signing workflow)
- **Audit logs** (track all changes)
- **Export to PDF** (generate compliance reports)

### Box Webhooks for Real-Time Updates

1. Create a webhook pointing to your Vercel app:
   ```typescript
   await boxClient.webhooks.create(
     BOX_ROOT_FOLDER_ID,
     'folder',
     'https://your-app.vercel.app/api/webhooks/box',
     ['FILE.UPLOADED', 'METADATA_INSTANCE.UPDATED']
   );
   ```

2. Your app will receive real-time notifications when:
   - Files are uploaded directly to Box
   - Metadata is changed in Box UI
   - Folders are created/deleted

## Troubleshooting

### "Box SDK initialization failed"
- Check your `.env.local` file
- Ensure `BOX_PRIVATE_KEY` has `\n` characters preserved
- Verify your app is authorized in Box Admin Console

### "Failed to create metadata template"
- Template might already exist (check Box Admin → Metadata)
- Ensure app has "Manage enterprise properties" scope

### "Experiments folder not found"
- Make sure the project was created properly
- Check Box folder structure: Project folder should have `/Experiments` subfolder
- Try creating the project again

### Changes not showing up
- This app uses `cache: 'no-store'` so it always fetches fresh data
- Try refreshing the page
- Check Box directly to see if the change is there

## Support

For issues or questions:
- Check the [README.md](README.md) for detailed API documentation
- Review Box SDK docs: [Box Node SDK](https://github.com/box/box-node-sdk)
- Next.js docs: [Next.js Documentation](https://nextjs.org/docs)

## Success Checklist

- [x] Box Custom App created and authorized
- [x] Environment variables configured
- [x] Metadata templates created
- [x] Development server running
- [x] Created first project
- [x] Created first experiment
- [x] Created first entry
- [x] Verified data in Box
- [ ] Deployed to Vercel (optional)
- [ ] Set up webhooks (optional)

**You're all set! Start documenting your research with ELN Box!** 🎉
