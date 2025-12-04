# LabNoteX API Reference

This document describes all API endpoints available in LabNoteX.

## Base URL

- **Development:** `http://localhost:3000/api`
- **Production:** `https://eln-box.vercel.app/api`

## Authentication

All API routes (except `/auth/*`) require authentication via NextAuth session cookie.

### Session Cookie

After logging in via Box OAuth, a session cookie is automatically set. Include credentials in fetch requests:

```typescript
fetch('/api/projects', {
  credentials: 'include'  // Include session cookie
})
```

### Unauthorized Response

```json
{
  "error": "Unauthorized"
}
```
Status: `401`

---

## Authentication Endpoints

### GET /api/auth/session

Get current session info.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://..."
  },
  "expires": "2024-02-01T00:00:00.000Z"
}
```

### GET /api/auth/signin/box

Redirect to Box OAuth login.

### GET /api/auth/signout

Sign out and clear session.

---

## Projects

### GET /api/projects

List all projects.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Items per page (max 100) |
| `offset` | number | 0 | Starting index |

**Response:**
```json
{
  "items": [
    {
      "folderId": "123456789",
      "projectCode": "CHEM-2024-001",
      "projectName": "Novel Catalyst Development",
      "description": "Research into new catalysts...",
      "piName": "Dr. Jane Smith",
      "piEmail": "jane.smith@university.edu",
      "department": "Chemistry",
      "status": "active",
      "startDate": "2024-01-15",
      "experimentCount": 5
    }
  ],
  "totalCount": 10,
  "limit": 50,
  "offset": 0
}
```

### POST /api/projects

Create a new project.

**Request Body:**
```json
{
  "projectCode": "CHEM-2024-002",
  "projectName": "New Project Name",
  "description": "Project description",
  "piName": "Dr. John Doe",
  "piEmail": "john@university.edu",
  "department": "Chemistry",
  "status": "planning"
}
```

**Response:** `201 Created`
```json
{
  "folderId": "987654321",
  "projectCode": "CHEM-2024-002",
  "projectName": "New Project Name",
  ...
}
```

### GET /api/projects/[folderId]

Get a single project by Box folder ID.

**Response:**
```json
{
  "folderId": "123456789",
  "projectCode": "CHEM-2024-001",
  "projectName": "Novel Catalyst Development",
  "description": "Research into new catalysts...",
  "piName": "Dr. Jane Smith",
  "piEmail": "jane.smith@university.edu",
  "department": "Chemistry",
  "status": "active",
  "startDate": "2024-01-15"
}
```

### PATCH /api/projects/[folderId]

Update a project.

**Request Body:** (partial update)
```json
{
  "status": "completed",
  "description": "Updated description"
}
```

**Response:** `200 OK` with updated project

---

## Experiments

### GET /api/projects/[folderId]/experiments

List experiments in a project.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Items per page |
| `offset` | number | 0 | Starting index |

**Response:**
```json
{
  "items": [
    {
      "folderId": "111222333",
      "experimentId": "EXP-001",
      "experimentTitle": "Aspirin Synthesis",
      "objective": "Synthesize aspirin via acetylation",
      "hypothesis": "Yield >80% expected",
      "status": "completed",
      "ownerName": "Dr. Jane Smith",
      "ownerEmail": "jane@university.edu",
      "startedAt": "2024-01-20",
      "completedAt": "2024-01-25",
      "tags": ["synthesis", "organic"]
    }
  ],
  "totalCount": 5,
  "limit": 50,
  "offset": 0
}
```

### POST /api/projects/[folderId]/experiments

Create a new experiment.

**Request Body:**
```json
{
  "experimentId": "EXP-002",
  "experimentTitle": "New Synthesis",
  "objective": "Test new reaction conditions",
  "hypothesis": "Higher yield expected",
  "status": "draft",
  "tags": ["synthesis", "optimization"]
}
```

**Response:** `201 Created`
```json
{
  "folderId": "444555666",
  "experimentId": "EXP-002",
  ...
}
```

### GET /api/experiments/[folderId]

Get experiment details by Box folder ID.

**Response:**
```json
{
  "folderId": "111222333",
  "experimentId": "EXP-001",
  "experimentTitle": "Aspirin Synthesis",
  "objective": "Synthesize aspirin via acetylation",
  "hypothesis": "Yield >80% expected",
  "status": "completed",
  "ownerName": "Dr. Jane Smith",
  "ownerEmail": "jane@university.edu",
  "startedAt": "2024-01-20",
  "completedAt": "2024-01-25",
  "tags": ["synthesis", "organic"]
}
```

### PATCH /api/experiments/[folderId]

Update experiment details.

**Request Body:**
```json
{
  "status": "completed",
  "completedAt": "2024-01-25"
}
```

---

## Experiment Data (Scientific Data)

These endpoints manage the structured scientific data for experiments.

### GET /api/experiment-data/[boxFolderId]

Get all scientific data for an experiment.

**Response:**
```json
{
  "experimentId": "uuid-here",
  "protocolSteps": [
    {
      "id": "uuid",
      "stepNumber": 1,
      "instruction": "Weigh 2.0g salicylic acid",
      "notes": null
    }
  ],
  "reagents": [
    {
      "id": "uuid",
      "name": "Salicylic acid",
      "amount": "2.0",
      "unit": "g",
      "molarAmount": "0.0145",
      "molarUnit": "mol",
      "observations": "White crystalline powder"
    }
  ],
  "yields": [
    {
      "id": "uuid",
      "productName": "Aspirin",
      "theoretical": "2.61",
      "actual": "2.19",
      "percentage": "84",
      "unit": "g"
    }
  ],
  "spectra": [
    {
      "id": "uuid",
      "boxFileId": "777888999",
      "spectrumType": "IR",
      "title": "IR Spectrum of Product",
      "caption": "Key peaks at 1750 cm⁻¹ (C=O stretch)",
      "peakData": { "peaks": [1750, 1680, 1220] }
    }
  ]
}
```

---

## Protocol Steps

### GET /api/experiment-data/[boxFolderId]/protocol

Get all protocol steps.

**Response:**
```json
{
  "steps": [
    {
      "id": "uuid",
      "stepNumber": 1,
      "instruction": "Weigh 2.0g salicylic acid",
      "notes": null
    },
    {
      "id": "uuid",
      "stepNumber": 2,
      "instruction": "Add 3mL acetic anhydride",
      "notes": "Add slowly in fume hood"
    }
  ]
}
```

### POST /api/experiment-data/[boxFolderId]/protocol

Add a new protocol step.

**Request Body:**
```json
{
  "stepNumber": 3,
  "instruction": "Heat to reflux for 15 minutes",
  "notes": "Monitor temperature carefully"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "stepNumber": 3,
  "instruction": "Heat to reflux for 15 minutes",
  "notes": "Monitor temperature carefully"
}
```

### PATCH /api/experiment-data/[boxFolderId]/protocol/[stepId]

Update a protocol step.

**Request Body:**
```json
{
  "instruction": "Heat to reflux for 20 minutes",
  "notes": "Extended time for better yield"
}
```

### DELETE /api/experiment-data/[boxFolderId]/protocol/[stepId]

Delete a protocol step.

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

## Reagents

### GET /api/experiment-data/[boxFolderId]/reagents

Get all reagents for an experiment.

**Response:**
```json
{
  "reagents": [
    {
      "id": "uuid",
      "name": "Salicylic acid",
      "amount": "2.0",
      "unit": "g",
      "molarAmount": "0.0145",
      "molarUnit": "mol",
      "observations": "White crystalline powder"
    }
  ]
}
```

### POST /api/experiment-data/[boxFolderId]/reagents

Add a new reagent.

**Request Body:**
```json
{
  "name": "Acetic anhydride",
  "amount": 3.0,
  "unit": "mL",
  "molarAmount": 0.0317,
  "molarUnit": "mol",
  "observations": "Excess used"
}
```

**Response:** `201 Created`

### PATCH /api/experiment-data/[boxFolderId]/reagents/[reagentId]

Update a reagent.

### DELETE /api/experiment-data/[boxFolderId]/reagents/[reagentId]

Delete a reagent.

---

## Yields

### GET /api/experiment-data/[boxFolderId]/yields

Get all yields for an experiment.

**Response:**
```json
{
  "yields": [
    {
      "id": "uuid",
      "productName": "Aspirin",
      "theoretical": "2.61",
      "actual": "2.19",
      "percentage": "84",
      "unit": "g"
    }
  ]
}
```

### POST /api/experiment-data/[boxFolderId]/yields

Add a yield record.

**Request Body:**
```json
{
  "productName": "Aspirin",
  "theoretical": 2.61,
  "actual": 2.19,
  "percentage": 84,
  "unit": "g"
}
```

### PATCH /api/experiment-data/[boxFolderId]/yields/[yieldId]

Update a yield.

### DELETE /api/experiment-data/[boxFolderId]/yields/[yieldId]

Delete a yield.

---

## Spectra

### GET /api/experiment-data/[boxFolderId]/spectra

Get all spectra for an experiment.

**Response:**
```json
{
  "spectra": [
    {
      "id": "uuid",
      "boxFileId": "777888999",
      "spectrumType": "IR",
      "title": "IR Spectrum of Product",
      "caption": "C=O stretch at 1750 cm⁻¹",
      "peakData": { "peaks": [1750, 1680] }
    }
  ]
}
```

### POST /api/experiment-data/[boxFolderId]/spectra

Add a spectrum record.

**Request Body:**
```json
{
  "boxFileId": "777888999",
  "spectrumType": "NMR",
  "title": "1H NMR of Product",
  "caption": "Aromatic protons at 7.2-8.0 ppm",
  "peakData": { "peaks": [7.2, 7.8, 8.0] }
}
```

**Spectrum Types:** `IR`, `NMR`, `MS`, `UV-Vis`, `other`

### PATCH /api/experiment-data/[boxFolderId]/spectra/[spectrumId]

Update a spectrum.

### DELETE /api/experiment-data/[boxFolderId]/spectra/[spectrumId]

Delete a spectrum.

---

## Dashboard / Analytics

### GET /api/dashboard/stats

Get dashboard statistics.

**Response:**
```json
{
  "overview": {
    "projects": 5,
    "experiments": 25,
    "users": 3,
    "spectra": 15,
    "avgYield": 82.5
  },
  "experimentsByStatus": [
    { "status": "completed", "count": 10 },
    { "status": "in-progress", "count": 8 },
    { "status": "draft", "count": 5 },
    { "status": "locked", "count": 2 }
  ],
  "recentExperiments": [
    {
      "id": "uuid",
      "title": "Recent Synthesis",
      "experimentId": "EXP-010",
      "status": "in-progress",
      "createdAt": "2024-01-25T10:00:00Z"
    }
  ],
  "yieldsData": [
    {
      "id": "uuid",
      "productName": "Aspirin",
      "percentage": "84"
    }
  ],
  "spectraByType": [
    { "spectrum_type": "IR", "count": 5 },
    { "spectrum_type": "NMR", "count": 8 },
    { "spectrum_type": "MS", "count": 2 }
  ],
  "topReagents": [
    { "name": "Ethanol", "count": 15 },
    { "name": "Sulfuric acid", "count": 10 }
  ]
}
```

---

## Box File Operations

### GET /api/box/folders/[folderId]/items

List files in a Box folder.

**Response:**
```json
{
  "items": [
    {
      "id": "999888777",
      "name": "spectrum.png",
      "type": "file",
      "size": 245000,
      "modified_at": "2024-01-25T15:30:00Z"
    },
    {
      "id": "666555444",
      "name": "Attachments",
      "type": "folder"
    }
  ]
}
```

---

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "error": "Missing required field: experimentId"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Experiment not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create project"
}
```

---

## TypeScript Types

```typescript
// Project
interface Project {
  folderId: string;
  projectCode: string;
  projectName: string;
  description?: string;
  piName?: string;
  piEmail?: string;
  department?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  startDate?: string;
}

// Experiment
interface Experiment {
  folderId: string;
  experimentId: string;
  experimentTitle: string;
  objective?: string;
  hypothesis?: string;
  status: 'draft' | 'in-progress' | 'completed' | 'locked';
  ownerName?: string;
  ownerEmail?: string;
  startedAt?: string;
  completedAt?: string;
  tags?: string[];
}

// Protocol Step
interface ProtocolStep {
  id: string;
  stepNumber: number;
  instruction: string;
  notes?: string;
}

// Reagent
interface Reagent {
  id: string;
  name: string;
  amount?: number;
  unit?: string;
  molarAmount?: number;
  molarUnit?: string;
  observations?: string;
}

// Yield
interface Yield {
  id: string;
  productName?: string;
  theoretical?: number;
  actual?: number;
  percentage?: number;
  unit?: string;
}

// Spectrum
interface Spectrum {
  id: string;
  boxFileId?: string;
  spectrumType: 'IR' | 'NMR' | 'MS' | 'UV-Vis' | 'other';
  title?: string;
  caption?: string;
  peakData?: Record<string, any>;
}
```

---

## Rate Limits

Currently no rate limits are enforced. For production use, consider implementing:
- Per-user request limits
- API key authentication for integrations
- Request throttling

---

## Changelog

### v0.1.0
- Initial API release
- Projects, Experiments CRUD
- Scientific data endpoints (protocol, reagents, yields, spectra)
- Dashboard statistics
- Box file browser
