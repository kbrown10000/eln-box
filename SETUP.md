# LabNoteX Setup Guide

Complete installation and configuration instructions for LabNoteX.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Box Developer Account** - [Sign up](https://account.box.com/signup/developer)
- **Neon Account** - [Sign up](https://neon.tech/) (free tier available)
- **Vercel Account** - [Sign up](https://vercel.com/) (optional, for deployment)

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/kbrown10000/eln-box.git
cd eln-box
npm install
```

---

## Step 2: Create Box Applications

You need **two** Box applications:

### 2a. Box OAuth App (User Authentication)

This app handles user login.

1. Go to [Box Developer Console](https://app.box.com/developers/console)
2. Click **Create New App**
3. Select **Custom App**
4. Choose **User Authentication (OAuth 2.0)**
5. Name it (e.g., "LabNoteX Auth")
6. Click **Create App**

**Configuration:**
1. Go to **Configuration** tab
2. Under **OAuth 2.0 Redirect URI**, add:
   - `http://localhost:3000/api/auth/callback/box` (development)
   - `https://your-domain.vercel.app/api/auth/callback/box` (production)
3. Under **Application Scopes**, enable:
   - ✅ Read all files and folders stored in Box
   - ✅ Write all files and folders stored in Box
4. Save changes

**Note these values:**
- Client ID → `BOX_OAUTH_CLIENT_ID`
- Client Secret → `BOX_OAUTH_CLIENT_SECRET`

### 2b. Box JWT App (Service Account)

This app handles server-side operations (folder creation, metadata).

1. Go to [Box Developer Console](https://app.box.com/developers/console)
2. Click **Create New App**
3. Select **Custom App**
4. Choose **Server Authentication (with JWT)**
5. Name it (e.g., "LabNoteX Service")
6. Click **Create App**

**Configuration:**
1. Go to **Configuration** tab
2. Under **Application Scopes**, enable:
   - ✅ Read all files and folders stored in Box
   - ✅ Write all files and folders stored in Box
   - ✅ Manage users
   - ✅ Manage enterprise properties
3. Under **Advanced Features**, enable:
   - ✅ Generate user access tokens
4. Under **Add and Manage Public Keys**:
   - Click **Generate a Public/Private Keypair**
   - Download the JSON config file
5. Save changes

**Authorize the App (Admin Required):**
1. Go to [Box Admin Console](https://app.box.com/master)
2. Navigate to **Apps** → **Custom Apps Manager**
3. Click **Authorize New App**
4. Enter the **Client ID** from your JWT app
5. Click **Authorize**

**From the downloaded JSON file, note:**
- `clientID` → `BOX_CLIENT_ID`
- `clientSecret` → `BOX_CLIENT_SECRET`
- `enterpriseID` → `BOX_ENTERPRISE_ID`
- `publicKeyID` → `BOX_PUBLIC_KEY_ID`
- `privateKey` → `BOX_PRIVATE_KEY` (keep `\n` characters)
- `passphrase` → `BOX_PASSPHRASE`

---

## Step 3: Create Box Folder Structure

1. Log into [Box](https://app.box.com)
2. Create a new folder called **ELN-Root** (or any name)
3. Inside it, create a subfolder called **Projects**
4. Note the folder IDs from the URL:
   - When viewing ELN-Root: `https://app.box.com/folder/123456789`
     - `123456789` → `BOX_ROOT_FOLDER_ID`
   - When viewing Projects: `https://app.box.com/folder/987654321`
     - `987654321` → `BOX_PROJECTS_FOLDER_ID`

---

## Step 4: Create Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Click **Create Project**
3. Choose a name and region
4. Once created, go to **Connection Details**
5. Copy the **Pooled connection string**
   - Example: `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`
   - This → `POSTGRES_URL`

---

## Step 5: Configure Environment Variables

### Create .env.local

```bash
cp .env.local.example .env.local
```

### Fill in all values

```bash
# ===========================================
# DATABASE
# ===========================================
POSTGRES_URL=postgresql://user:password@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# ===========================================
# NEXTAUTH
# ===========================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here-at-least-32-chars

# ===========================================
# BOX OAUTH (User Authentication)
# ===========================================
BOX_OAUTH_CLIENT_ID=your-oauth-client-id
BOX_OAUTH_CLIENT_SECRET=your-oauth-client-secret

# ===========================================
# BOX JWT (Service Account)
# ===========================================
BOX_CLIENT_ID=your-jwt-client-id
BOX_CLIENT_SECRET=your-jwt-client-secret
BOX_ENTERPRISE_ID=123456
BOX_PUBLIC_KEY_ID=abcd1234
BOX_PRIVATE_KEY="-----BEGIN ENCRYPTED PRIVATE KEY-----\nMIIFDjBABgkqhkiG...\n-----END ENCRYPTED PRIVATE KEY-----\n"
BOX_PASSPHRASE=your-passphrase

# ===========================================
# BOX FOLDER IDs
# ===========================================
BOX_ROOT_FOLDER_ID=123456789
BOX_PROJECTS_FOLDER_ID=987654321

# ===========================================
# APP URL
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Generate NEXTAUTH_SECRET

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

### Important: BOX_PRIVATE_KEY Format

The private key must be on a single line with `\n` for newlines:

```bash
BOX_PRIVATE_KEY="-----BEGIN ENCRYPTED PRIVATE KEY-----\nMIIFDjBA...\nmore-lines...\n-----END ENCRYPTED PRIVATE KEY-----\n"
```

---

## Step 6: Set Up Database Schema

Push the schema to your Neon database:

```bash
# Option 1: With environment variable inline
POSTGRES_URL="your-connection-string" npx drizzle-kit push

# Option 2: If .env.local is loaded automatically
npx drizzle-kit push
```

You should see output like:
```
[✓] Changes applied
```

### View Database (Optional)

```bash
POSTGRES_URL="your-connection-string" npx drizzle-kit studio
```

This opens a web UI at `https://local.drizzle.studio` to browse your database.

---

## Step 7: Set Up Box Metadata Templates

Create the required metadata templates in Box:

```bash
npm run setup-box-templates
```

This creates:
- `projectMetadata` - For project folders
- `experimentMetadata` - For experiment folders
- `entryMetadata` - For entry files

---

## Step 8: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see:
- Home page with "Get Started" button
- Click "Get Started" → Redirects to login
- "Sign in with Box" button
- After login → Dashboard

---

## Step 9: Seed Demo Data (Optional)

To populate with sample data:

```bash
# Create the seed script runner
POSTGRES_URL="your-connection-string" npx tsx scripts/seed-demo-data.ts
```

This creates:
- 5 sample experiments
- Protocol steps, reagents, yields, and spectra
- Realistic chemistry data

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Click **Deploy**

### 3. Environment Variables in Vercel

Add all variables from `.env.local` to Vercel:

| Variable | Value |
|----------|-------|
| `POSTGRES_URL` | Your Neon connection string |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` |
| `NEXTAUTH_SECRET` | Your secret |
| `BOX_OAUTH_CLIENT_ID` | From Box OAuth app |
| `BOX_OAUTH_CLIENT_SECRET` | From Box OAuth app |
| `BOX_CLIENT_ID` | From Box JWT app |
| `BOX_CLIENT_SECRET` | From Box JWT app |
| `BOX_ENTERPRISE_ID` | From Box JSON config |
| `BOX_PUBLIC_KEY_ID` | From Box JSON config |
| `BOX_PRIVATE_KEY` | From Box JSON config |
| `BOX_PASSPHRASE` | From Box JSON config |
| `BOX_ROOT_FOLDER_ID` | Your ELN root folder |
| `BOX_PROJECTS_FOLDER_ID` | Your Projects folder |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` |

### 4. Update Box Redirect URI

In Box Developer Console, add your production URL to the OAuth app's redirect URIs:
- `https://your-project.vercel.app/api/auth/callback/box`

---

## Troubleshooting

### "Unauthorized" after login

- Check `BOX_OAUTH_CLIENT_ID` and `BOX_OAUTH_CLIENT_SECRET`
- Verify redirect URI matches exactly
- Check `NEXTAUTH_SECRET` is set

### "Failed to create folder"

- Verify JWT app is authorized in Box Admin Console
- Check `BOX_PROJECTS_FOLDER_ID` exists and service account has access
- Ensure all JWT credentials are correct

### Database connection errors

- Verify `POSTGRES_URL` uses the pooler endpoint (`-pooler.`)
- Check `?sslmode=require` is in the URL
- Ensure Neon project is not suspended

### "Environment validation failed"

- Check all required variables are set
- Verify `BOX_PRIVATE_KEY` format (single line with `\n`)
- Ensure no trailing spaces in values

### Box metadata template errors

- Templates may already exist (safe to ignore)
- Ensure JWT app has "Manage enterprise properties" scope
- Run `npm run setup-box-templates` again if needed

---

## Development Tips

### Hot Reload

The dev server automatically reloads on file changes. If you modify:
- `.env.local` → Restart the dev server
- Database schema → Run `npx drizzle-kit push`

### Viewing API Requests

Open browser DevTools → Network tab to see API calls and responses.

### Database Queries

Use Drizzle Studio to inspect data:
```bash
POSTGRES_URL="..." npx drizzle-kit studio
```

### Box API Explorer

Use [Box API Explorer](https://developer.box.com/reference/) to test API calls directly.

---

## Next Steps

1. **Customize** - Modify the UI in `app/components/`
2. **Add Features** - See [ARCHITECTURE.md](./ARCHITECTURE.md) for extension points
3. **Secure** - Review user roles and permissions
4. **Monitor** - Set up Vercel analytics and error tracking
