# Nexora Law Platform API & Actions Reference

## Public Endpoints
- `POST /api/intake`: Case intake form submission (Zod validated).
- Payload: `client_name`, `email`, `phone`, `case_type`, `message`

### Example Request
```json
{
  "client_name": "Demo Client",
  "email": "client@example.com",
  "phone": "+1-800-555-0100",
  "case_type": "Corporate & Commercial Litigation",
  "message": "Seeking corporate litigation advisory."
}
```

### Responses
- `200 OK`: Intake inquiry submitted successfully.
- `400 Bad Request`: Validation failure on input fields.
- `429 Too Many Requests`: Rate limiter exceeded.

---

## Protected Admin Routes
- `GET /api/admin/cases`: List and filter firm cases (Admin/Staff only).
- `POST /api/admin/cases`: Create case docket (Admin/Staff only).
- `PATCH /api/admin/cases`: Update status and notes for cases (Admin/Staff only).

### Headers
- `Cookie`: Authenticated admin session cookie (`nexora_admin_session`) or Authorization token.

### Query Parameters for `GET /api/admin/cases`
- `page`: Page index (default: `1`)
- `limit`: Records per page (default: `20`, max: `100`)

### Payload for `PATCH /api/admin/cases`
```json
{
  "case_id": 1,
  "status": "inactive",
  "under_section": "Sec. 12(a) Commercial Arbitration Act"
}
```

---

## Server Actions Reference

### Public Server Actions
- `submitIntakeAction(formData: FormData)`: Validates and persists public consultation requests into `contacts` table.

### Administrative Server Actions (`app/actions/cases.ts`, `app/actions/admin.ts`)
- `adminLoginAction(formData: FormData)`: Authenticates administrator using timing-safe password verification and issues HTTP-only session JWT.
- `adminLogoutAction()`: Clears administrative session cookie.
- `createCaseAction(formData: FormData)`: Gated docket creation with Zod schema verification.
- `updateCaseStatusAction(formData: FormData)`: Updates case status and revalidates `/cases` and `/admin`.
- `deleteCaseAction(formData: FormData)`: Deletes specified docket entry and triggers cache revalidation.
- `uploadCaseDocumentAction(formData: FormData)`: Attaches client vault document record with metadata.

---

## Server actions (v1.1.0)

All admin actions call `requireAdmin()` first; client actions call `requireClient()` (or are the login itself).

| Action | File | Auth | Purpose |
|---|---|---|---|
| `adminLoginAction` / `adminLogoutAction` | `app/actions/admin.ts` | public / admin | Admin session |
| `createCaseAction`, `updateCaseStatusAction`, `deleteCaseAction` | `app/actions/cases.ts` | admin | Case management (status change also writes a timeline entry and notifies clients) |
| `addCaseEventAction`, `deleteCaseEventAction` | `app/actions/events.ts` | admin | Case timeline |
| `createClientAction`, `resetClientPasswordAction`, `setClientActiveAction`, `grantCaseAccessAction`, `revokeCaseAccessAction` | `app/actions/clients.ts` | admin | Client accounts and per-case access |
| `clientLoginAction`, `clientLogoutAction`, `markNotificationsReadAction` | `app/actions/client.ts` | public / client | Client portal session and notifications |
| `submitConsultationIntake` | `app/actions/intake.ts` | public | Consultation intake (anon INSERT only) |

Pages: `/client`, `/client/login`, `/client/cases/[caseId]` (client session + access list), `/admin/cases`, `/admin/cases/[caseId]`, `/admin/clients` (admin session).

### Files (v1.2.0)
| Item | Auth | Purpose |
|---|---|---|
| `uploadCaseFileAction`, `deleteCaseFileAction` (`app/actions/files.ts`) | admin | Upload (max 4 MB; PDF/PNG/JPG/TXT/DOCX) and delete case files |
| `GET /api/files/:fileId` | admin, or a client with case access and `client_visible = true` | 302 redirect to a 60-second signed storage URL; 401 without a session, 404 otherwise |

> Case logic is shared: both the server actions and `/api/admin/cases` call `lib/cases-service.ts` after verifying the admin session. REST errors never include raw database messages.
