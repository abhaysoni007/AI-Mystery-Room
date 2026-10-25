# AI Mystery Room — API Specification

**File:** `docs/API.md`  
**Version:** 1.0.0  
**Status:** Authoritative API contract  
**Base path:** `/api/v1`  
**Runtime:** Node.js + Express  
**Database:** MongoDB + Mongoose  
**AI provider:** Google Gemini  
**Primary clients:** React web application and automated tests

---

## 0. Purpose and authority

This document defines HTTP endpoints, authentication expectations, request/response formats, status codes, validation, idempotency, and public/private response boundaries.

- `SPEC.md` defines product behavior and architecture.
- `API.md` defines the HTTP contract.
- `DATA_MODEL.md` defines persisted entities, relationships, indexes, and field ownership.
- `DESIGN_SPEC.md` defines UI design.
- `USER_FLOWS.md` defines navigation and interaction flows.

If the implementation changes an API contract, update this file and affected tests in the same change. Do not silently change response shapes.

## 1. API conventions

### 1.1 Base URL

Development default: `http://localhost:5000/api/v1`

The frontend must read the backend origin from environment configuration. Never hardcode production origins throughout the codebase.

### 1.2 Content type

JSON request/response bodies use:

`Content-Type: application/json`

File/media uploads, if introduced, must have a separately documented multipart contract. Large media should not be sent as base64 JSON.

### 1.3 Success envelope

All successful JSON endpoints use a consistent envelope:

```json
{
  "success": true,
  "data": {},
  "message": "Request completed successfully",
  "meta": {}
}
```

- `data` is required; use `null`, an object, or an array as appropriate.
- `message` is optional for endpoints where it adds value.
- `meta` is optional and used for pagination or operation metadata.
- Do not expose internal provider output, secrets, database internals, or private solution fields.

Example without optional fields:

```json
{
  "success": true,
  "data": {}
}
```

### 1.4 Error envelope

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The supplied input is invalid",
    "fields": {
      "scenario": "Enter a longer scenario."
    },
    "requestId": "req_example"
  }
}
```

- `code` is a stable machine-readable error code.
- `message` is safe for display.
- `fields` is optional and contains field-level validation messages.
- `requestId` is optional and supports diagnostics.
- Never include stack traces, API keys, database URIs, raw Gemini errors, prompts containing private solutions, or internal model output.

### 1.5 HTTP status codes

| Status | Meaning |
|---|---|
| `200` | Successful read or mutation |
| `201` | Resource created |
| `202` | Async job accepted, if job-based generation is implemented |
| `204` | Successful operation with no response body, only if explicitly documented |
| `400` | Malformed request or invalid path/query syntax |
| `401` | Missing/invalid/expired authentication |
| `403` | Authenticated but not permitted, when distinguishing is safe |
| `404` | Resource unavailable or not found |
| `409` | State conflict, duplicate final submission, or idempotency conflict |
| `413` | Request body too large |
| `422` | Well-formed request failing business validation |
| `429` | Rate limit exceeded |
| `500` | Unexpected internal failure |
| `502` | Upstream provider returned an unusable response |
| `503` | Required service temporarily unavailable |
| `504` | Upstream request timed out |

For private cases, a `404` response may be used for both nonexistent and inaccessible resources to avoid revealing whether another user's resource exists. Use one consistent policy.

### 1.6 Identifier and timestamp conventions

- MongoDB resources use string representations of ObjectIds at the API boundary unless the repository has a documented alternative.
- Embedded suspect, timeline event, and evidence IDs are stable strings within their case.
- Timestamps are ISO 8601 UTC strings.
- Clients must not infer local timezone from an unqualified timestamp.
- Do not accept client-supplied owner IDs as authority.

### 1.7 Authentication

For password-based authentication, use a secure HTTP-only cookie session/token strategy as defined in `SPEC.md`.

Production cookie expectations:
- `HttpOnly`
- `Secure`
- appropriate `SameSite`
- narrowly scoped cookie path/domain
- CSRF protection for cookie-authenticated state-changing requests as appropriate

Do not place session tokens in local storage. The backend must verify the session for every protected endpoint.

### 1.8 CSRF, CORS, and rate limiting

- Restrict CORS to configured origins.
- Apply CSRF protections appropriate to cookie authentication.
- Rate-limit registration, login, generation, assistant requests, and other expensive endpoints.
- Apply request-size limits.
- Validate all path parameters, query parameters, and request bodies.
- Use Helmet or equivalent security headers.
- Never rely on frontend route guards for authorization.

### 1.9 Idempotency and duplicate requests

- Generation requests must prevent accidental duplicate cases caused by double-clicks or retries. Use an idempotency key if supported by the client/server architecture, or persist a request/job identity.
- Final accusation is one-time by default. Enforce this at service and database levels.
- Notes updates should be safe to retry where possible.
- Destructive operations must not be triggered by ambiguous repeated requests.

---

# 2. Authentication endpoints

Authentication endpoints are required when account-based access is enabled.

## 2.1 `POST /auth/register`

Creates a user account.

### Request

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "example-password"
}
```

### Validation

- `name`: required, trimmed, bounded length.
- `email`: required, normalized, valid email format.
- `password`: required and validated against the password policy.
- Reject unknown fields unless the validation strategy explicitly strips them.
- Never log the plaintext password.

### Success — `201`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "Alex Morgan",
      "email": "alex@example.com",
      "createdAt": "2030-01-01T10:00:00.000Z"
    }
  },
  "message": "Account created"
}
```

A secure session may be established through a cookie. Never return `passwordHash`.

### Errors

- `400 VALIDATION_ERROR`
- `409 EMAIL_ALREADY_REGISTERED` only if the account-enumeration policy permits this distinction; otherwise use the agreed generic response.
- `429 RATE_LIMITED`
- `500 INTERNAL_ERROR`

## 2.2 `POST /auth/login`

### Request

```json
{
  "email": "alex@example.com",
  "password": "example-password"
}
```

### Success — `200`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "Alex Morgan",
      "email": "alex@example.com"
    }
  },
  "message": "Signed in"
}
```

Session credentials are set through the configured secure cookie mechanism, not exposed in JSON when cookie sessions are used.

### Errors

- `400 VALIDATION_ERROR`
- `401 INVALID_CREDENTIALS`
- `429 RATE_LIMITED`
- `500 INTERNAL_ERROR`

## 2.3 `POST /auth/logout`

Invalidates the current session according to the selected session implementation and clears the cookie.

### Success

```json
{
  "success": true,
  "data": null,
  "message": "Signed out"
}
```

Do not claim server-side revocation if the implementation only clears a client cookie and cannot revoke the session.

## 2.4 `GET /auth/me`

Returns the currently authenticated user.

### Success — `200`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "Alex Morgan",
      "email": "alex@example.com",
      "createdAt": "2030-01-01T10:00:00.000Z"
    }
  }
}
```

### Errors

- `401 UNAUTHENTICATED`

---

# 3. Case generation and case management

## 3.1 `POST /cases/generate`

Creates a fictional mystery from a user scenario.

### Request

```json
{
  "scenario": "A museum curator disappears on the night a rare painting is moved.",
  "difficulty": "medium",
  "category": "theft",
  "length": "standard",
  "tone": "suspenseful",
  "setting": "A modern city museum",
  "suspectCount": 4
}
```

Optional fields may be omitted. The implementation must validate allowed enum values and use defaults defined in `SPEC.md`.

### Validation

- `scenario`: required, trimmed, non-empty, within configured length bounds.
- `difficulty`: `easy`, `medium`, or `hard`.
- `category`: one of the supported category values.
- `length`: `short`, `standard`, or `extended`.
- `tone`: only supported tone values.
- `setting`: optional bounded string.
- `suspectCount`: integer within the product's permitted range.
- Enforce request-size and rate limits.
- Treat scenario text as untrusted creative input, not as system instructions.

### Synchronous success — `201`

Use this when the full case is generated and validated before the response.

```json
{
  "success": true,
  "data": {
    "case": {
      "id": "case_id",
      "title": "The Gallery After Midnight",
      "category": "theft",
      "difficulty": "medium",
      "status": "active",
      "summary": "A rare painting disappears during a late-night museum event.",
      "createdAt": "2030-01-01T10:00:00.000Z"
    }
  },
  "message": "Mystery created"
}
```

Only return public case summary fields. Do not return the full canonical case solution.

### Asynchronous alternative — `202`

If generation is implemented as a background job, return:

```json
{
  "success": true,
  "data": {
    "job": {
      "id": "generation_job_id",
      "status": "queued",
      "caseId": null
    }
  },
  "message": "Generation accepted"
}
```

If this design is adopted, document the job lifecycle and implement the status endpoint below. Do not mix synchronous and asynchronous semantics without a clear contract.

### Errors

- `400 VALIDATION_ERROR`
- `401 UNAUTHENTICATED` when account access is required
- `413 REQUEST_TOO_LARGE`
- `422 INVALID_GENERATION_OPTIONS`
- `429 RATE_LIMITED`
- `502 AI_PROVIDER_ERROR`
- `503 GENERATION_UNAVAILABLE`
- `504 GENERATION_TIMEOUT`

Failure must not create a playable partial case. Preserve safe diagnostics server-side.

## 3.2 `GET /generation-jobs/:jobId` (optional asynchronous generation)

Returns the status of an authorized generation job.

### Success

```json
{
  "success": true,
  "data": {
    "job": {
      "id": "generation_job_id",
      "status": "running",
      "stage": null,
      "caseId": null,
      "errorCode": null,
      "updatedAt": "2030-01-01T10:01:00.000Z"
    }
  }
}
```

Allowed status values: `queued`, `running`, `succeeded`, `failed`, `cancelled` if cancellation is genuinely supported.

- `stage` is optional and must be based on real backend progress.
- `caseId` is populated only after a playable case exists.
- Do not expose prompts, model output, culprit ID, or private solution data.

## 3.3 `GET /cases`

Lists cases owned by the current user.

### Query parameters

- `status`: optional `active`, `completed`, `generating`, `failed`.
- `limit`: optional bounded integer.
- `cursor`: optional pagination cursor.

### Success

```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "case_id",
        "title": "The Gallery After Midnight",
        "category": "theft",
        "difficulty": "medium",
        "status": "active",
        "summary": "A rare painting disappears during a late-night event.",
        "createdAt": "2030-01-01T10:00:00.000Z",
        "updatedAt": "2030-01-01T10:10:00.000Z",
        "completedAt": null
      }
    ]
  },
  "meta": {
    "nextCursor": null,
    "hasMore": false
  }
}
```

Only include progress metadata if it is actually available and defined by the implementation. Do not expose private solution fields.

## 3.4 `GET /cases/:caseId`

Returns public case data for an authorized owner.

### Success

```json
{
  "success": true,
  "data": {
    "case": {
      "id": "case_id",
      "title": "The Gallery After Midnight",
      "category": "theft",
      "difficulty": "medium",
      "status": "active",
      "summary": "A rare painting disappears during a late-night event.",
      "incident": {
        "description": "A painting is reported missing after the museum closes.",
        "location": "North Gallery",
        "occurredAt": "2030-01-01T21:30:00.000Z"
      },
      "suspectCount": 4,
      "evidenceCount": 10,
      "createdAt": "2030-01-01T10:00:00.000Z",
      "updatedAt": "2030-01-01T10:10:00.000Z"
    }
  }
}
```

This is a public view contract. Do not include the full suspect/evidence/solution document unless explicitly intended for that route. Use dedicated endpoints for those resources.

## 3.5 `DELETE /cases/:caseId`

Deletes an owned case and its associated user progress and media according to the deletion policy.

### Success

```json
{
  "success": true,
  "data": null,
  "message": "Case deleted"
}
```

### Errors

- `401 UNAUTHENTICATED`
- `404 CASE_NOT_FOUND`
- `409 CASE_DELETE_CONFLICT` if deletion cannot safely complete
- `500 INTERNAL_ERROR`

Deletion must be authorized and idempotent where practical. Do not leave accessible orphaned media.

---

# 4. Suspect endpoints

## 4.1 `GET /cases/:caseId/suspects`

Returns the public suspect list.

### Success

```json
{
  "success": true,
  "data": {
    "suspects": [
      {
        "id": "suspect_01",
        "name": "Alex Morgan",
        "occupation": "Museum curator",
        "relationship": "Managed the gallery",
        "summary": "A senior curator with access to the collection.",
        "portraitAssetId": "asset_id_or_null"
      }
    ]
  }
}
```

Do not include private motives, hidden alibi truth, culprit labels, secret suspicion scores, or internal clue classifications.

## 4.2 `GET /cases/:caseId/suspects/:suspectId`

Returns one public suspect profile.

### Success

```json
{
  "success": true,
  "data": {
    "suspect": {
      "id": "suspect_01",
      "name": "Alex Morgan",
      "occupation": "Museum curator",
      "relationship": "Managed the gallery",
      "background": "A public-facing profile summary.",
      "publicStatement": "I was in the administration office.",
      "portraitAssetId": "asset_id_or_null",
      "relatedEvidenceIds": ["evidence_01"],
      "relatedEventIds": ["event_01"]
    }
  }
}
```

All related IDs must refer to resources the user can access. If relationship data is absent, omit the field or return an empty array consistently.

---

# 5. Evidence endpoints

## 5.1 `GET /cases/:caseId/evidence`

Returns a paginated public evidence list.

### Query parameters

- `type`: optional supported evidence type.
- `limit`: optional bounded integer.
- `cursor`: optional pagination cursor.
- `q`: optional search term if search is implemented.

### Success

```json
{
  "success": true,
  "data": {
    "evidence": [
      {
        "id": "evidence_01",
        "type": "chat",
        "title": "Recovered Messages",
        "description": "A fictional conversation recovered during the investigation.",
        "occurredAt": "2030-01-01T21:10:00.000Z",
        "createdAt": "2030-01-01T10:00:00.000Z",
        "relatedSuspectIds": ["suspect_01"],
        "relatedEventIds": ["event_01"],
        "mediaAssetId": null
      }
    ]
  },
  "meta": {
    "nextCursor": null,
    "hasMore": false
  }
}
```

Do not return hidden classification, decisive flag, private rationale, culprit ID, or full solution fields.

## 5.2 `GET /cases/:caseId/evidence/:evidenceId`

Returns the public content for one evidence item.

### Success

```json
{
  "success": true,
  "data": {
    "evidence": {
      "id": "evidence_01",
      "type": "chat",
      "title": "Recovered Messages",
      "description": "A fictional conversation recovered during the investigation.",
      "occurredAt": "2030-01-01T21:10:00.000Z",
      "sourceContext": "Recovered from a fictional device in the case.",
      "content": {
        "participants": [
          {
            "id": "person_01",
            "displayName": "Alex"
          }
        ],
        "messages": [
          {
            "id": "message_01",
            "participantId": "person_01",
            "text": "Meet me by the west entrance.",
            "sentAt": "2030-01-01T21:10:00.000Z",
            "status": "sent"
          }
        ]
      },
      "relatedSuspectIds": ["suspect_01"],
      "relatedEventIds": ["event_01"],
      "media": null
    }
  }
}
```

`content` must be validated against the evidence type. This example is illustrative; the production schema is defined in `DATA_MODEL.md`.

## 5.3 `POST /cases/:caseId/evidence/:evidenceId/read`

Marks an evidence item as reviewed if that feature is implemented.

### Request

```json
{
  "reviewed": true
}
```

### Success

```json
{
  "success": true,
  "data": {
    "evidenceId": "evidence_01",
    "reviewed": true,
    "reviewedAt": "2030-01-01T10:15:00.000Z"
  }
}
```

This operation must be idempotent. If the product does not track review state, do not expose the endpoint or the corresponding control.

---

# 6. Investigation progress and notes

## 6.1 `GET /cases/:caseId/progress`

Returns the current user's progress for an authorized case.

### Success

```json
{
  "success": true,
  "data": {
    "progress": {
      "caseId": "case_id",
      "status": "active",
      "openedEvidenceIds": ["evidence_01"],
      "startedAt": "2030-01-01T10:00:00.000Z",
      "lastActivityAt": "2030-01-01T10:15:00.000Z",
      "completedAt": null
    }
  }
}
```

Do not include canonical solution fields.

## 6.2 `PATCH /cases/:caseId/progress`

Updates permitted progress fields.

### Request

```json
{
  "openedEvidenceIds": ["evidence_01", "evidence_02"]
}
```

The server must validate that all evidence IDs belong to the case. Do not allow clients to set `status` to `completed`, set scores, or write solution fields through this endpoint.

### Success

Return the authoritative updated progress record using the same shape as the GET endpoint.

## 6.3 `GET /cases/:caseId/notes`

Returns the current user's notes for the case.

### Success

```json
{
  "success": true,
  "data": {
    "notes": {
      "caseId": "case_id",
      "content": "The access log conflicts with the stated alibi.",
      "updatedAt": "2030-01-01T10:20:00.000Z",
      "version": 3
    }
  }
}
```

If notes do not exist, return a consistent empty record rather than treating the absence as an unexpected server failure.

## 6.4 `PUT /cases/:caseId/notes`

Creates or replaces the current user's notes for the case.

### Request

```json
{
  "content": "The access log conflicts with the stated alibi.",
  "version": 3
}
```

`version` may be used for optimistic concurrency if implemented. If the API does not support versions, omit it from the contract and use a documented last-write policy.

### Success

```json
{
  "success": true,
  "data": {
    "notes": {
      "caseId": "case_id",
      "content": "The access log conflicts with the stated alibi.",
      "updatedAt": "2030-01-01T10:21:00.000Z",
      "version": 4
    }
  },
  "message": "Notes saved"
}
```

Show “Saved” only after this response or an equivalent authoritative success response.

## 6.5 `DELETE /cases/:caseId/notes/:noteId`

Only expose if notes are stored as separately addressable records. If notes are one document per user/case, use the documented replacement/clear operation instead. Do not implement two competing note models.

---

# 7. Accusation and results

## 7.1 `POST /cases/:caseId/accusations`

Submits the final accusation.

### Request

```json
{
  "suspectId": "suspect_01",
  "reasoning": "The access log conflicts with the suspect's stated alibi."
}
```

`reasoning` is optional and bounded by server validation.

### Preconditions

- User is authorized to access the case.
- Case is active.
- Suspect exists in the case.
- No final accusation already exists when the one-attempt policy is enabled.
- Server validates all conditions and owns the decision.

### Success — `201`

```json
{
  "success": true,
  "data": {
    "accusation": {
      "id": "accusation_id",
      "caseId": "case_id",
      "selectedSuspectId": "suspect_01",
      "isCorrect": false,
      "score": 0,
      "submittedAt": "2030-01-01T10:30:00.000Z"
    },
    "resultAvailable": true
  },
  "message": "Accusation submitted"
}
```

This endpoint is the authorized completion boundary. The response may include the result summary only if the case has been marked completed and the API contract explicitly permits it. Otherwise the client must fetch the result endpoint.

### Errors

- `400 VALIDATION_ERROR`
- `401 UNAUTHENTICATED`
- `404 CASE_OR_SUSPECT_NOT_FOUND`
- `409 CASE_ALREADY_COMPLETED`
- `409 ACCUSATION_ALREADY_SUBMITTED`
- `422 INVALID_ACCUSATION`
- `500 INTERNAL_ERROR`

The final result must use deterministic server-side comparison. Gemini must not decide whether the selected suspect is correct.

## 7.2 `GET /cases/:caseId/result`

Returns solution/reveal data only when the case is completed and the current user is authorized.

### Success

```json
{
  "success": true,
  "data": {
    "result": {
      "caseId": "case_id",
      "status": "completed",
      "selectedSuspectId": "suspect_01",
      "isCorrect": false,
      "score": 0,
      "culprit": {
        "id": "suspect_03",
        "name": "Jordan Lee"
      },
      "solution": {
        "motive": "Private motive explanation now authorized for reveal.",
        "method": "Explanation of the fictional incident.",
        "rationale": "Evidence-based solution explanation.",
        "decisiveEvidenceIds": ["evidence_02", "evidence_07"],
        "redHerringExplanations": [
          {
            "evidenceId": "evidence_04",
            "explanation": "Why this clue initially appeared suspicious."
          }
        ]
      },
      "completedAt": "2030-01-01T10:30:00.000Z"
    }
  }
}
```

This example is only valid after authorized completion. The `culprit` and `solution` fields must never appear in ordinary case, suspect, evidence, or progress responses.

## 7.3 `POST /cases/:caseId/assistant/messages` (optional)

If an investigation assistant is implemented:

### Request

```json
{
  "message": "Compare the recovered messages with the station access log.",
  "contextEvidenceIds": ["evidence_01", "evidence_03"]
}
```

### Success

```json
{
  "success": true,
  "data": {
    "message": {
      "id": "assistant_message_id",
      "text": "The messages place the participants near the entrance shortly before the access log records a badge scan.",
      "createdAt": "2030-01-01T10:40:00.000Z"
    }
  }
}
```

The service must authorize each evidence ID, sanitize context, treat evidence text as untrusted content, and prevent solution leakage. Do not expose the private solution to the assistant context during normal play.

---

# 8. Media delivery contracts

## 8.1 Asset references

API responses should return an asset identifier or an authorized media URL according to the storage design. Prefer short-lived signed URLs or a protected media endpoint for private media.

Example:

```json
{
  "media": {
    "assetId": "asset_id",
    "mediaType": "image",
    "mimeType": "image/webp",
    "url": "short-lived-authorized-url",
    "expiresAt": "2030-01-01T11:00:00.000Z"
  }
}
```

The URL above is illustrative, not a real link.

## 8.2 Media rules

- Never accept arbitrary model-generated URLs without validation.
- Validate ownership, storage key, MIME type, size, and retrieval permission.
- Do not expose permanent public URLs for private evidence unless that is an explicit approved policy.
- A missing asset must not cause the evidence record to disappear.
- A simulated surveillance reconstruction must be identified as simulated.
- Do not claim a media generation operation succeeded until the provider and storage steps have succeeded.

---

# 9. Public/private response boundary

The API must enforce the following boundary at serialization and service layers.

## Public before completion

May include:
- Case title, category, difficulty, public summary, public incident facts.
- Public suspect profiles and statements.
- Public timeline.
- Public evidence content and metadata.
- Public evidence relationships.
- User's own progress and notes.
- Generation status and safe error codes.

Must not include:
- Canonical culprit ID.
- Private solution object.
- Private motive/method/rationale.
- Hidden evidence classifications.
- Secret clue scores or internal clue weights.
- Private validator output that reveals the answer.
- Raw prompts that contain the private solution.
- Other users' notes, progress, or cases.

## Authorized after completion

May include:
- Selected suspect and correctness.
- Culprit identity.
- Motive and method.
- Full solution rationale.
- Decisive evidence references.
- Red-herring explanations.
- Final score and completion timestamp.

## Enforcement

- Use explicit DTO/serializer functions for public case, suspect, evidence, progress, and result responses.
- Do not serialize Mongoose documents directly to the frontend.
- Add tests that assert private fields are absent from every pre-completion response.
- The client must not receive private fields and merely hide them with CSS.
- Treat all AI-generated output as untrusted until validated.

---

# 10. Validation, errors, and retries

## 10.1 Error codes

Use stable machine-readable codes, including where relevant:

- `VALIDATION_ERROR`
- `UNAUTHENTICATED`
- `FORBIDDEN`
- `CASE_NOT_FOUND`
- `SUSPECT_NOT_FOUND`
- `EVIDENCE_NOT_FOUND`
- `CASE_ALREADY_COMPLETED`
- `ACCUSATION_ALREADY_SUBMITTED`
- `GENERATION_UNAVAILABLE`
- `AI_PROVIDER_ERROR`
- `GENERATION_TIMEOUT`
- `MEDIA_UNAVAILABLE`
- `RATE_LIMITED`
- `INTERNAL_ERROR`

Document any additional codes introduced by implementation.

## 10.2 Retry policy

- Retry only transient errors.
- Use bounded exponential backoff on server-side provider calls.
- Do not automatically retry final accusation or deletion without checking authoritative state.
- Preserve safe user input on failed requests.
- Never expose raw provider stack traces to clients.

---

# 11. OpenAPI alignment and contract testing

The implementation should maintain an OpenAPI 3.x description of these endpoints when practical. The API examples in this document are normative shapes for the initial contract, but must be reconciled with actual schema validators before implementation is considered complete.

Required tests:
- Authentication response does not expose password hashes or tokens in JSON when cookie auth is used.
- Public case response excludes `solution` and culprit identifiers.
- Suspect and evidence endpoints exclude hidden clue classifications.
- Progress endpoint cannot modify completion status or score.
- Final accusation is deterministic and single-submit according to product policy.
- Result endpoint denies reveal before authorized completion.
- User cannot read or mutate another user's case.
- Generation failure does not create a playable partial case.
- Media URLs are authorized and do not expose private storage keys.
- Pagination and query validation reject invalid values.

---

# 12. Implementation checklist for Codex

1. Read `SPEC.md`, `DATA_MODEL.md`, and this document before writing routes.
2. Inspect the repository and preserve its existing route/controller/service conventions.
3. Implement shared success/error response helpers.
4. Implement request validation schemas.
5. Implement authentication and ownership middleware.
6. Implement public/private serializers before exposing case data.
7. Implement endpoints in dependency order: auth, case creation/list/read, suspects/evidence, progress/notes, accusation/result, optional assistant/media.
8. Use mocked Gemini responses in integration tests.
9. Add deterministic tests for authorization and solution secrecy.
10. Keep the actual OpenAPI document synchronized with route validation and tests.
11. Report any endpoint omitted, altered, or deferred; do not claim full API completion if an endpoint is only stubbed.

**End of `docs/API.md` — Version 1.0.0**
