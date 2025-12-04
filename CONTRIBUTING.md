# Contributing to LabNoteX

Thank you for your interest in contributing to LabNoteX! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 18+
- npm
- Git
- Access to Box Developer Console
- Neon Postgres account

### Local Development

1. **Fork and clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/eln-box.git
   cd eln-box
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Set up database**
   ```bash
   POSTGRES_URL="your-url" npx drizzle-kit push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

---

## Project Structure

```
eln-box/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── projects/          # Project pages
│   ├── experiments/       # Experiment pages
│   ├── dashboard/         # Dashboard page
│   └── login/             # Auth pages
├── lib/                   # Shared libraries
│   ├── auth/             # Authentication
│   ├── box/              # Box SDK wrappers
│   └── db/               # Database (Drizzle)
├── scripts/              # Setup scripts
└── public/               # Static assets
```

---

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define types for API responses and props
- Avoid `any` - use proper types or `unknown`

```typescript
// Good
interface ExperimentProps {
  id: string;
  title: string;
  status: 'draft' | 'in-progress' | 'completed';
}

// Avoid
const experiment: any = { ... };
```

### React Components

- Use functional components with hooks
- Prefer Server Components when possible
- Mark Client Components with `'use client'` at top

```typescript
// Server Component (default)
export default async function ProjectPage({ params }) {
  const data = await getData(params.id);
  return <div>{data.name}</div>;
}

// Client Component
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### File Naming

- React components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- API routes: `route.ts` (Next.js convention)
- Pages: `page.tsx` (Next.js convention)

### Imports

Order imports as:
1. React/Next.js
2. Third-party libraries
3. Local imports (absolute paths)
4. Relative imports
5. Types

```typescript
import { useState } from 'react';
import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { experiments } from '@/lib/db/schema';

import { formatDate } from './utils';

import type { Experiment } from '@/lib/box/types';
```

---

## API Development

### Route Structure

```typescript
// app/api/experiments/[folderId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  // 1. Auth check
  const { session, error } = await requireApiAuth();
  if (error) return error;

  // 2. Get params
  const { folderId } = await params;

  try {
    // 3. Business logic
    const data = await getExperiment(folderId);

    // 4. Return response
    return NextResponse.json(data);
  } catch (err) {
    // 5. Error handling
    console.error('Error:', err);
    return NextResponse.json(
      { error: 'Failed to get experiment' },
      { status: 500 }
    );
  }
}
```

### Database Queries

Use Drizzle ORM for all database operations:

```typescript
import { db } from '@/lib/db';
import { experiments, reagents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Select
const results = await db
  .select()
  .from(experiments)
  .where(eq(experiments.boxFolderId, folderId));

// Insert
const [newReagent] = await db
  .insert(reagents)
  .values({ name: 'Test', experimentId: expId })
  .returning();

// Update
await db
  .update(experiments)
  .set({ status: 'completed' })
  .where(eq(experiments.id, id));

// Delete
await db
  .delete(reagents)
  .where(eq(reagents.id, id));
```

---

## UI Components

### Styling

Use Tailwind CSS for all styling:

```tsx
// Good
<button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
  Submit
</button>

// Avoid inline styles
<button style={{ backgroundColor: 'blue' }}>Submit</button>
```

### Common Patterns

**Loading State:**
```tsx
const [loading, setLoading] = useState(true);

if (loading) {
  return <div className="animate-pulse bg-gray-200 h-4 rounded" />;
}
```

**Error State:**
```tsx
const [error, setError] = useState<string | null>(null);

{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
    {error}
  </div>
)}
```

**Form Handling:**
```tsx
const [formData, setFormData] = useState({ name: '', amount: '' });

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  try {
    await fetch('/api/...', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  } catch (err) {
    setError('Failed to submit');
  } finally {
    setSubmitting(false);
  }
};
```

---

## Testing

### Running Tests

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit
```

### Manual Testing Checklist

Before submitting a PR, verify:

- [ ] Page loads without errors
- [ ] Authentication flow works
- [ ] CRUD operations succeed
- [ ] Error states display correctly
- [ ] Loading states appear
- [ ] Mobile responsive
- [ ] No console errors

---

## Git Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

### Commit Messages

Use clear, descriptive messages:

```
feat: add yield calculator component
fix: resolve authentication redirect issue
docs: update API documentation
refactor: simplify experiment data fetching
```

### Pull Requests

1. **Create a branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push and create PR**
   ```bash
   git push origin feature/my-feature
   ```

4. **PR Description Template**
   ```markdown
   ## Summary
   Brief description of changes

   ## Changes
   - Added X
   - Fixed Y
   - Updated Z

   ## Testing
   - [ ] Tested locally
   - [ ] No lint errors
   - [ ] Types check passes

   ## Screenshots
   (if UI changes)
   ```

---

## Adding New Features

### 1. Database Changes

If adding a new table:

```typescript
// lib/db/schema.ts
export const newTable = pgTable('new_table', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  // ... fields
});

// Run migration
// POSTGRES_URL="..." npx drizzle-kit push
```

### 2. API Route

```typescript
// app/api/new-feature/route.ts
export async function GET(request: NextRequest) {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  // Implementation
}
```

### 3. UI Component

```typescript
// app/components/NewFeature.tsx
'use client';

export function NewFeature({ data }: NewFeatureProps) {
  // Component logic
}
```

### 4. Wire Up

```typescript
// In parent page/component
import { NewFeature } from '@/app/components/NewFeature';

// Use component
<NewFeature data={fetchedData} />
```

---

## Common Tasks

### Add a New API Field

1. Update `lib/db/schema.ts`
2. Run `npx drizzle-kit push`
3. Update API routes to include field
4. Update TypeScript types
5. Update UI components

### Add a New Page

1. Create `app/your-page/page.tsx`
2. Add to navigation in `app/layout.tsx`
3. Create any needed components
4. Add API routes if needed

### Modify Box Integration

1. Check `lib/box/client.ts` for client setup
2. `lib/box/folders.ts` for folder operations
3. `lib/box/files.ts` for file operations
4. Test with Box API Explorer first

---

## Questions?

- Check existing code for patterns
- Look at [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions
- Open an issue for discussion

---

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Keep discussions professional

Thank you for contributing!
