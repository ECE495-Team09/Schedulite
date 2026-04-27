# Verification Test Inventory

This document lists all verification tests (automated and manual) used to confirm correct behavior of the Schedulite application. It should be updated when new tests are added or removed.

**Last updated:** 2026-04-27

---

## Summary

| Type              | Count | Location / notes                          |
|-------------------|-------|-------------------------------------------|
| Automated – Unit  | 19    | `backend/src/` and `clients/web/src/` (Vitest) |
| Automated – Integration | 5 | `backend/src/app.integration.test.js` (Vitest + Supertest + in-memory MongoDB) |
| Manual            | 9     | Existing reports + April 2026 mobile/web verification passes |

---

## Automated tests

### Unit tests

| ID | What is verified | File |
|----|------------------|------|
| UT-001 | `requireAuth`: 401 when Authorization header is missing | `backend/src/middleware/requireAuth.test.js` |
| UT-002 | `requireAuth`: 401 when token is not Bearer type | `backend/src/middleware/requireAuth.test.js` |
| UT-003 | `requireAuth`: 401 when token is invalid or expired | `backend/src/middleware/requireAuth.test.js` |
| UT-004 | `requireAuth`: calls next() and sets req.user when token is valid | `backend/src/middleware/requireAuth.test.js` |
| UT-005 | `getGroupIfMember`: returns null when groupId is missing | `backend/src/services/groupAccess.test.js` |
| UT-006 | `getGroupIfMember`: returns null when userId is missing | `backend/src/services/groupAccess.test.js` |
| UT-007 | `getGroupIfMember`: returns null when user is not a member | `backend/src/services/groupAccess.test.js` |
| UT-008 | `getGroupIfMember`: returns the group when user is a member | `backend/src/services/groupAccess.test.js` |
| UT-009 | `getAvatarColor`: same seed returns the same color | `clients/web/src/utils/avatar.test.js` |
| UT-010 | `getAvatarColor`: returns { background, color } with valid hex values | `clients/web/src/utils/avatar.test.js` |
| UT-011 | `getAvatarColor`: different seeds usually map to different colors | `clients/web/src/utils/avatar.test.js` |
| UT-012 | `getAvatarColor`: empty string seed falls back to a valid palette color | `clients/web/src/utils/avatar.test.js` |
| UT-013 | `getAvatarColor`: non-string seed falls back to a valid palette color | `clients/web/src/utils/avatar.test.js` |
| UT-014 | `api`: attaches `Authorization: Bearer <token>` header when token exists | `clients/web/src/api/client.test.js` |
| UT-015 | `api`: throws error with body `error` message when response is not ok | `clients/web/src/api/client.test.js` |
| UT-016 | `healthCheck`: returns `true` only when backend responds with `{ ok: true }` | `clients/web/src/api/client.test.js` |
| UT-017 | `loginWithGoogle`: posts `idToken` payload through `api` helper | `clients/web/src/api/client.test.js` |

### Integration tests

| ID | What is verified | File |
|----|------------------|------|
| **INT-001** | **GET /health** returns 200 with `ok: true` and a `version` string | `backend/src/app.integration.test.js` |
| **INT-002** | **GET /me** returns 401 when Authorization header is missing | `backend/src/app.integration.test.js` |
| **INT-003** | **GET /me** returns 401 when Bearer token is invalid | `backend/src/app.integration.test.js` |
| **INT-004** | **GET /me** returns 200 and current user when valid JWT is provided (full request path + DB) | `backend/src/app.integration.test.js` |

### Part 2 Tests

| ID | Type | What is verified | File |
|----|------|------------------|------|
| UT-018 | Unit | `requireAuth`: 401 when `Bearer` is provided without a token | `backend/src/middleware/requireAuth.test.js` |
| UT-019 | Unit | `getGroupIfMember`: calls `Group.findOne` with the provided `groupId` and `userId` query scope | `backend/src/services/groupAccess.test.js` |
| INT-005 | Integration | `GET /api/getGroups`: returns 401 when Authorization header is missing | `backend/src/app.integration.test.js` |

**How to run automated tests:** From repo root, `cd backend && npm run test`.

---

## Manual tests

| ID | What is verified | Evidence / report |
|----|------------------|-------------------|
| MT_001 | User `/me` routes: GET, PUT, DELETE with auth vs no-auth (Postman) | `doc/manual_tests/results/MT_001/` (report + screenshots) |
| MT_002 | Group CRUD: Create, GET, PUT, DELETE with auth vs no-auth (Postman) | `doc/manual_tests/results/MT_002/` (report + screenshots) |
| MT_003 | Mobile nav parity: removed duplicate Home link and verified `Schedulite` title routes to home | April 2026 manual app walkthrough (mobile + web nav) |
| MT_004 | Mobile group admin actions: role changes, member kick, and group disband flows | April 2026 manual app walkthrough (admin account) |
| MT_005 | Mobile event create parity: recurrence, reminder presets, and create flow end-to-end | April 2026 manual app walkthrough (create event + backend persistence check) |
| MT_006 | Mobile event settings parity: edit event, reminder updates, recurrence updates, and delete event | April 2026 manual app walkthrough (event settings + group refresh) |
| MT_007 | Push notifications baseline: FCM token registration + event notifications routed to group members | April 2026 iOS/Android push validation session |
| MT_008 | iOS scheduling UI robustness: native date/time picker UX for event start + repeat-until fields | April 2026 iOS manual UI pass |
| MT_009 | RSVP notification actions: notification action buttons trigger RSVP update path (foreground/background validation) | April 2026 manual push action validation |

---

## Adding or changing tests

- **New automated test:** Add the test in the appropriate file, then add a row to the table above (Unit or Integration) with a new ID (UT-xxx or INT-xxx) and update the Summary count.
- **New manual test:** Create a report under `doc/manual_tests/results/MT_xxx/` using `doc/manual_tests/TEMPLATE.md`, then add a row to the Manual tests table and update the Summary count.
- **Removed test:** Delete the test code/report and remove or mark obsolete the corresponding row in this inventory.
