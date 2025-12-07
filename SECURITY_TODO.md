# Security TODO - Box Permission Enforcement

**Priority: P1 - Must fix before production use**

## Current Issue

All Box API operations use the enterprise service account (JWT authentication), which bypasses Box folder permissions entirely. Any authenticated user can read/write ANY project or experiment folder, regardless of whether they have access to that folder in Box.

### Affected Files

- `lib/box/client.ts` (lines 38-95) - `getBoxClient()` returns enterprise-wide client
- All API routes that use Box helpers:
  - `/api/projects/*`
  - `/api/experiments/*`
  - `/api/box/folders/*`
  - `/api/entries/*`

### Why This Happens

```typescript
// Current: Uses enterprise service account for everything
const boxClient = getBoxClient(); // JWT enterprise client
const folder = await boxClient.folders.get(folderId);
```

The `requireApiAuth()` check only verifies a user is logged in - it doesn't scope Box operations to that user's permissions.

## Solution Options

### Option A: Use User's OAuth Token (Recommended)

Use the authenticated user's Box OAuth token for Box API calls:

```typescript
// In API routes:
const { session } = await requireApiAuth();
const boxClient = await getBoxClientForUser(session.user.boxAccessToken);
const folder = await boxClient.folders.get(folderId);
// Now Box enforces permissions - user can only access folders they have rights to
```

**Requires:**
1. Store user's Box access token in session (already done via NextAuth)
2. Store refresh token for token refresh
3. Update `getBoxClientForUser()` to accept user token
4. Update all Box helper functions to accept/use user client
5. Handle token refresh when access token expires

### Option B: Explicit Permission Checks

Keep service account but verify user has folder access before operations:

```typescript
// In API routes:
const { session } = await requireApiAuth();

// Check if user has access to this folder via Box collaborations API
const hasAccess = await checkUserFolderAccess(session.user.boxUserId, folderId);
if (!hasAccess) {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}

// Then use service account
const boxClient = getBoxClient();
const folder = await boxClient.folders.get(folderId);
```

**Requires:**
1. New function to check Box folder collaborations
2. Add checks to every API route that accesses Box
3. More API calls (performance impact)

### Option C: Database-Level Access Control

Track folder ownership in our database and check there:

```typescript
// In API routes:
const { session } = await requireApiAuth();

// Check database for user's project/experiment access
const hasAccess = await db.query.projectAccess.findFirst({
  where: and(
    eq(projectAccess.userId, session.user.id),
    eq(projectAccess.projectId, projectId)
  )
});

if (!hasAccess) {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
```

**Requires:**
1. New database tables for access control
2. Sync mechanism with Box collaborations
3. Additional complexity in access management

## Recommended Approach

**Option A (User OAuth Token)** is recommended because:
- Leverages Box's built-in permission system
- No additional database tables needed
- Permissions stay in sync automatically
- Simplest long-term maintenance

## Implementation Steps

1. [ ] Update NextAuth config to store Box refresh token in session
2. [ ] Add token refresh logic to `getBoxClientForUser()`
3. [ ] Create `getUserBoxClient()` helper that handles token refresh
4. [ ] Update `lib/box/folders.ts` functions to accept optional user client
5. [ ] Update `lib/box/files.ts` functions to accept optional user client
6. [ ] Update API routes to pass user client:
   - [ ] `/api/projects/route.ts`
   - [ ] `/api/projects/[folderId]/route.ts`
   - [ ] `/api/projects/[folderId]/experiments/route.ts`
   - [ ] `/api/experiments/[folderId]/route.ts`
   - [ ] `/api/box/folders/[folderId]/items/route.ts`
7. [ ] Test with multiple users having different folder access
8. [ ] Update documentation

## Temporary Mitigations

Until this is fixed:
- **Do not use in production with sensitive data**
- Limit who can create accounts
- All users effectively have admin access to all data
- Consider this a demo/prototype only

## References

- Box SDK User Authentication: https://developer.box.com/guides/authentication/oauth2/
- Box Collaborations API: https://developer.box.com/reference/resources/collaboration/
- NextAuth Token Refresh: https://authjs.dev/guides/refresh-token-rotation

## Completed Security Fixes

### [FIXED] Token Endpoint Privilege Escalation
**Date:** 2025-12-05
**Issue:** The `/api/box/token` endpoint previously accepted any scope requested by the client, potentially allowing a malicious user to request `root_readwrite` or other elevated privileges if the service account possessed them.
**Fix:** Implemented a strict whitelist of allowed scopes (e.g., `item_preview`, `base_explorer`, `item_upload`). The endpoint now filters all requested scopes against this whitelist before generating the token.
**File:** `app/api/box/token/route.ts`
