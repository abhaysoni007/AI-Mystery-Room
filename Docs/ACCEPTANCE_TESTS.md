# ACCEPTANCE_TESTS.md — AI Mystery Room

**Document status:** Implementation-ready acceptance checklist  
**Purpose:** Define observable, repeatable checks for visual consistency, user interactions, responsive layouts, accessibility, and end-to-end functionality.

> These tests describe expected product behavior. Confirm routes, component names, API contracts, and test selectors against the current repository before implementation. Do not treat a passing mock or isolated component test as proof that the full application works.

## 1. Test conventions

### 1.1 Priority and result

- **P0 — Release blocker:** Authentication, case integrity, privacy boundaries, core investigation, accusation/result correctness, or a major usability failure.
- **P1 — Required:** Main user flows, responsive usability, accessibility fundamentals, and recoverable error states.
- **P2 — Quality improvement:** Non-blocking polish and secondary interactions.

Mark each test **PASS**, **FAIL**, **BLOCKED**, or **NOT RUN**. A test passes only when its stated observable result is verified. Record the build/commit, environment, viewport, browser, test data, evidence (screenshot/video/log), and any issue ID.

### 1.2 Test environment

Run tests against a deployed preview or local environment with the backend and database configured. Use a dedicated test account and deterministic seed data where possible. Use a controlled AI-provider response for repeatable generation tests; run a separate smoke test against the real provider if configured.

Minimum browser coverage:
- Chromium-based desktop browser, current stable.
- Firefox, current stable.
- Safari/WebKit, current stable where supported.
- Mobile viewport emulation plus at least one real mobile-device smoke test before release.

Minimum viewport matrix:

| Profile | Viewport |
|---|---:|
| Small mobile | 320 × 568 |
| Typical mobile | 390 × 844 |
| Large mobile | 430 × 932 |
| Tablet portrait | 768 × 1024 |
| Laptop | 1366 × 768 |
| Desktop | 1440 × 900 |
| Wide desktop | 1920 × 1080 |

Use exact viewport dimensions in test reports. Responsive behavior must be verified at intermediate widths as well as the listed breakpoints.

### 1.3 Recommended automation

- **Playwright:** End-to-end flows, viewport checks, keyboard navigation, screenshots, and browser console/network assertions.
- **Testing Library + a unit-test runner:** Component behavior and accessible queries.
- **axe-core or equivalent:** Automated accessibility checks, supplemented by manual keyboard and screen-reader checks.
- **API integration tests:** Authorization, validation, lifecycle transitions, and private-data leakage.
- **Visual regression:** Stable seeded data, fixed viewport, disabled animations, and controlled fonts/images. Review snapshots rather than blindly accepting changed baselines.

Prefer stable `data-testid` attributes only where semantic locators are not practical. Prefer role/name/label-based selectors such as `getByRole()` and `getByLabel()`.

---

## 2. Visual consistency

| ID | Priority | Test and steps | Acceptance criteria |
|---|---|---|---|
| VIS-001 | P1 | Open every primary screen: login, registration, dashboard, case creation, active investigation, suspect details, evidence details, accusation, and result. | Each screen uses the shared design tokens for colors, typography, spacing, borders, radii, shadows, and focus states. No unexplained one-off styles or conflicting component variants. |
| VIS-002 | P1 | Compare buttons, text fields, selects, cards, dialogs, badges, navigation, loading indicators, and alerts across screens. | Components of the same semantic type have consistent height, padding, typography, interaction states, and disabled styling. |
| VIS-003 | P1 | Inspect heading hierarchy, body copy, labels, metadata, and long content. | Typography hierarchy is clear and consistent. Text is not clipped, overlapping, or unreadably small at supported viewports. |
| VIS-004 | P1 | Trigger hover, focus, active, disabled, loading, success, and error states on applicable controls. | Every state is visually distinguishable and consistent. State changes do not cause unintended layout shifts. |
| VIS-005 | P1 | Load screens with long case titles, long suspect names, large evidence descriptions, and empty optional fields. | Content wraps or truncates according to an intentional rule; no overlap, broken layout, or hidden primary action. |
| VIS-006 | P2 | Capture reference screenshots with stable data at the agreed viewport matrix. | No unexplained visual regressions. Differences in dynamic timestamps, generated media, or nondeterministic content are controlled or reviewed explicitly. |
| VIS-007 | P1 | Inspect imagery, evidence thumbnails, avatars, and backgrounds with successful and failed asset loads. | Images preserve intended aspect ratios and layout. Missing assets have useful fallbacks and do not break the page. |
| VIS-008 | P1 | Inspect contrast and text over images, gradients, or dark backgrounds. | Text and controls remain legible; contrast meets WCAG 2.2 AA criteria in applicable states. |

## 3. User interactions

| ID | Priority | Test and steps | Acceptance criteria |
|---|---|---|---|
| INT-001 | P0 | Submit registration with valid details, then sign in with the created account. | Account creation and login succeed; the user reaches the expected authenticated screen. Passwords are never displayed or returned by APIs. |
| INT-002 | P1 | Submit registration/login with missing, malformed, or invalid values. | Client-side and server-side validation provide clear, associated error messages. Invalid requests do not create sessions or records. |
| INT-003 | P0 | Sign out, then attempt to open a protected route directly. | Session is invalidated and protected content is inaccessible until re-authentication. |
| INT-004 | P0 | Start case generation and observe the UI until completion or failure. | The user sees a clear pending state, cannot accidentally start duplicate requests through repeated clicks, and receives a usable case or a recoverable error. |
| INT-005 | P1 | Refresh or navigate away while generation is pending, then return to the dashboard. | The UI reconciles with server state. It does not falsely report success or lose a server-created case. |
| INT-006 | P0 | Open a case, inspect suspects, evidence, and timeline, and navigate between investigation views. | Correct case data is shown; navigation preserves the selected case and does not mix data from another case. |
| INT-007 | P1 | Open and close suspect/evidence detail views using available controls, Escape, and supported backdrop behavior. | The view opens the intended item, can be dismissed through supported methods, and returns focus to the invoking control when appropriate. |
| INT-008 | P1 | Mark evidence as reviewed, if the product supports this action, then reload the case. | Reviewed state persists server-side and is reflected consistently across relevant views. If review state is intentionally local-only, behavior matches the documented specification. |
| INT-009 | P1 | Add, edit, and save investigation notes; reload and revisit the case. | Notes persist, are associated with the correct user and case, and have a clear save/error state. Concurrent edits follow the documented conflict policy. |
| INT-010 | P0 | Submit an accusation with a valid suspect and required fields. | The server validates the request, records the attempt according to the documented attempt policy, and returns the authoritative outcome. The client does not calculate correctness. |
| INT-011 | P0 | Attempt to submit a second accusation for the same case if the policy allows only one attempt. | The server rejects the duplicate with the documented status and message; no second accusation is created. |
| INT-012 | P1 | Trigger empty, loading, error, and populated states for lists and detail screens. | Each state is intentional, understandable, and offers an appropriate next action when possible. |
| INT-013 | P1 | Use browser Back/Forward and refresh on primary routes. | Route state remains coherent. Protected pages enforce authorization and data is re-fetched or restored safely. |
| INT-014 | P1 | Double-click primary actions and simulate a slow network. | Duplicate submissions are prevented in the UI and, where required, by server-side idempotency or uniqueness constraints. |
| INT-015 | P1 | Delete a case if deletion is supported, then revisit it from history and direct URL. | The case is removed or marked deleted according to the contract; stale cached data is not displayed as active. |

## 4. Responsive layout

Run the following tests at all viewport sizes listed in Section 1.2. Repeat with both short and long seeded content.

| ID | Priority | Test and steps | Acceptance criteria |
|---|---|---|---|
| RWD-001 | P0 | Open each primary route at 320 px width. | No unintended horizontal page scrolling. Core content and primary actions remain available. |
| RWD-002 | P1 | Resize from mobile to tablet to desktop and back without reloading. | Layout adapts without overlapping regions, lost controls, or stale layout state. |
| RWD-003 | P1 | Inspect navigation at mobile and desktop widths. | Navigation is usable at each size; mobile menus can open and close, expose accessible names, and do not trap focus incorrectly. |
| RWD-004 | P1 | Inspect case, suspect, and evidence cards/grids at narrow widths. | Columns collapse or reflow at appropriate breakpoints; text and actions remain readable and reachable. |
| RWD-005 | P1 | Open dialogs, drawers, or detail panels on mobile. | Dialog content fits the viewport, can scroll internally when needed, and retains access to close and primary actions. |
| RWD-006 | P1 | Use a mobile on-screen keyboard while entering notes or forms. | Focused fields and submit controls remain visible or can be reached by scrolling; the keyboard does not permanently obscure required actions. |
| RWD-007 | P1 | Rotate a supported mobile viewport between portrait and landscape. | Content remains usable, with no clipped primary action or fixed overlay blocking the screen. |
| RWD-008 | P1 | Test zoom at 200% and reflow at an equivalent narrow viewport. | Content remains usable without loss of information or functionality, except for content that inherently requires two-dimensional layout. |

## 5. Accessibility

Target **WCAG 2.2 Level AA**. Automated checks are necessary but do not replace manual review.

| ID | Priority | Test and steps | Acceptance criteria |
|---|---|---|---|
| A11Y-001 | P0 | Navigate all primary flows using only Tab, Shift+Tab, Enter, Space, and Escape where applicable. | All interactive functionality is keyboard-operable; focus order is logical and no keyboard trap occurs. |
| A11Y-002 | P0 | Inspect focus indicators on links, buttons, fields, menus, and dialogs. | Keyboard focus is visible and not obscured by sticky headers, overlays, or other content. |
| A11Y-003 | P1 | Inspect page landmarks and heading levels with accessibility-tree tools. | Each page has a meaningful title, appropriate landmarks, and a coherent heading hierarchy. |
| A11Y-004 | P0 | Inspect every form control with accessible-name queries. | Each field has a programmatic label. Required fields and validation errors are communicated to assistive technology. |
| A11Y-005 | P1 | Trigger validation errors and server failures. | Errors are associated with the relevant fields or region, expressed in text, and announced appropriately without relying on color alone. |
| A11Y-006 | P1 | Open and dismiss a modal or drawer. | Focus moves into the modal when appropriate, remains within a modal dialog while open, Escape behavior follows the design, and focus returns to the opener on close. |
| A11Y-007 | P1 | Inspect text, controls, icons, borders, and focus indicators for contrast. | Applicable text and non-text contrast meet WCAG 2.2 AA requirements. Do not use color as the only indicator of state. |
| A11Y-008 | P1 | Inspect icons and image alternatives. | Meaningful images have useful alternative text; decorative images are ignored by assistive technology. Icon-only controls have accessible names. |
| A11Y-009 | P1 | Test status changes such as generation progress, save confirmation, and errors. | Important asynchronous status messages are announced through suitable live regions without unnecessarily interrupting the user. |
| A11Y-010 | P1 | Test at 200% zoom and with increased text spacing where practical. | Text and controls remain usable, content is not clipped, and actions do not disappear. |
| A11Y-011 | P1 | Run axe-core or equivalent against each primary route and major overlay. | No unresolved critical or serious automated accessibility violations. Every exception has a documented reason and remediation owner. |
| A11Y-012 | P1 | Perform a manual screen-reader pass on one supported desktop screen reader and one mobile screen reader where supported. | Reading order, names, roles, states, dialog behavior, and asynchronous updates are understandable. |

## 6. End-to-end functionality

### E2E-001 — New user investigation (P0)

1. Register a new test account.
2. Sign in and create a mystery case using a supported difficulty or scenario option.
3. Wait for generation to finish.
4. Open the case and inspect its incident summary, suspects, timeline, and evidence.
5. Open multiple suspect and evidence details.
6. Add investigation notes and mark evidence reviewed if supported.
7. Submit an accusation.
8. View the result and the authorized solution reveal.

**Pass criteria:** The complete journey succeeds without manual database edits. The case, progress, notes, accusation, and result are associated with the correct user and case. The result matches the server's canonical solution. Every loading, empty, and error state encountered is handled safely.

### E2E-002 — Returning user and persistence (P0)

1. Sign in to an account with an active case and saved progress.
2. Open the case, update notes, and review evidence.
3. Refresh the page and sign out.
4. Sign back in and reopen the case.

**Pass criteria:** Server-persisted progress is restored accurately. One user's private data is never shown in another user's session.

### E2E-003 — Authorization and isolation (P0)

1. Create two separate test users, A and B.
2. Create a case under A and obtain its IDs through the test harness.
3. Authenticate as B and request A's case, progress, notes, accusation, result, and private media endpoints directly.
4. Repeat without a session and with an expired/invalid session.

**Pass criteria:** Unauthorized requests receive the documented 401/403/404 response without revealing private content. B cannot read, edit, delete, accuse on, or access private assets for A's case. Responses do not disclose whether a private case exists unless the API contract intentionally allows that disclosure.

### E2E-004 — Private solution boundary (P0)

1. Create a case with known seeded culprit, motive, method, and decisive evidence.
2. Inspect all pre-completion API responses and browser network responses for that case.
3. Search serialized payloads, page source, client state, logs exposed to the browser, and media metadata for the seeded private values.
4. Complete the investigation and request the authorized result.

**Pass criteria:** Before completion, no pre-completion response reveals the culprit, canonical solution, private motive/method/rationale, hidden clue classifications, or answer-bearing generation metadata. After authorized completion, only the reveal fields specified in the API contract are returned. A hidden field in the UI is not sufficient protection if it was delivered to the client.

### E2E-005 — Generation failure and recovery (P0)

1. Configure the test AI provider to time out, return malformed content, or return a provider error.
2. Request case generation.
3. Observe UI, server logs, database records, and retry behavior.
4. Retry using the supported recovery path.

**Pass criteria:** No invalid or partially generated case becomes playable. The UI reports a recoverable failure. The backend does not leak provider credentials or raw prompts. Retries do not create duplicate playable cases or orphaned records beyond documented cleanup behavior.

### E2E-006 — Duplicate and concurrent requests (P0)

1. Send two generation requests quickly for the same intended action.
2. Submit the same accusation twice in parallel when only one attempt is allowed.
3. Save notes from two sessions according to the documented concurrency policy.

**Pass criteria:** Database constraints and server logic enforce the product's uniqueness and concurrency rules. Duplicate accusations cannot bypass the attempt policy. Conflicting note updates follow the documented last-write-wins or version-conflict behavior.

### E2E-007 — Network interruption (P1)

1. Throttle or disconnect the network while loading a case, saving notes, and submitting an accusation.
2. Restore the network and retry through the UI.

**Pass criteria:** The user receives clear feedback; unsaved input is retained when feasible; retry behavior does not silently duplicate a non-idempotent action; the UI eventually reflects authoritative server state.

### E2E-008 — Data lifecycle and deletion (P1)

1. Create a case with progress, notes, accusation data where allowed, and media assets.
2. Delete the case or account using the supported workflow.
3. Attempt to access the deleted records and assets.

**Pass criteria:** Deletion and retention behavior matches the documented policy. Private media cannot be accessed through stale URLs after authorization or expiry. Related records are removed, anonymized, or retained only as explicitly specified.

### E2E-009 — Error contract (P1)

1. Exercise malformed payloads, missing required fields, nonexistent IDs, rate limits, and server errors.
2. Inspect HTTP status codes and JSON response envelopes.

**Pass criteria:** Responses conform to `API.md`; errors have stable machine-readable codes and safe user-facing messages. Stack traces, secrets, database details, raw provider errors, and private solution data are not returned to clients.

### E2E-010 — Production build and runtime smoke test (P0)

1. Run lint, typecheck if configured, unit tests, integration tests, and production build.
2. Launch the production build with documented environment variables.
3. Run smoke checks for authentication, dashboard, case generation, investigation, and result reveal.
4. Inspect browser console and network requests.

**Pass criteria:** Required checks pass; no uncaught runtime errors or unexpected failed assets occur in the core flow; environment configuration is documented and secrets remain server-side.

## 7. API and data contract checks

| ID | Priority | Verification | Acceptance criteria |
|---|---|---|---|
| API-001 | P0 | Compare actual endpoints and payloads with `API.md`. | Paths, methods, authentication, status codes, validation, and response envelopes match the contract or the document is updated with an approved change. |
| API-002 | P0 | Compare persisted records and indexes with `DATA_MODEL.md`. | Required ownership fields, unique indexes, lifecycle states, and references are implemented and enforced. |
| API-003 | P0 | Test every resource endpoint with owner, non-owner, and anonymous identities. | Authorization is enforced server-side for reads and writes; hiding a control in the frontend is not the sole authorization check. |
| API-004 | P0 | Inspect public serializers and error responses. | Private solution fields, passwords, secrets, internal prompt content, and sensitive model metadata are omitted. |
| API-005 | P1 | Test pagination, filtering, sorting, and boundary values where supported. | Invalid values are rejected or normalized consistently; limits prevent unbounded queries and responses. |
| API-006 | P1 | Test rate limits and retry behavior for authentication and generation endpoints. | Limits are enforced and return the documented error format without exposing internal infrastructure. |

## 8. Security and privacy checks

| ID | Priority | Verification | Acceptance criteria |
|---|---|---|---|
| SEC-001 | P0 | Attempt object-level authorization bypass by changing case, evidence, progress, and media IDs. | Every request validates ownership and permissions server-side. |
| SEC-002 | P0 | Inspect frontend bundles, source maps if published, network requests, and browser storage. | No AI-provider API key, database credential, signing secret, or other server-only secret is exposed. |
| SEC-003 | P0 | Submit script-like content in notes, names, descriptions, and other text inputs. | Content is rendered safely; stored or reflected XSS does not execute. |
| SEC-004 | P1 | Test malformed IDs, oversized bodies, unsupported content types, and invalid file uploads if supported. | Requests are validated and bounded; unsafe files are rejected and are not served as trusted executable content. |
| SEC-005 | P1 | Inspect cookies, CORS, CSRF protections, and security headers according to the selected authentication model. | Settings match the deployment architecture and security requirements; credentials are not exposed to unintended origins. |
| SEC-006 | P1 | Inspect logs and telemetry for authentication data, private solutions, prompts, and user notes. | Sensitive data is not logged unnecessarily; access to operational logs is restricted. |

## 9. Performance and resilience

| ID | Priority | Test | Acceptance criteria |
|---|---|---|---|
| PERF-001 | P1 | Measure primary screen load and interaction responsiveness on a representative laptop and mobile device. | Meet the team's documented performance budget. Establish explicit budgets before release; do not declare a pass without recorded measurements. |
| PERF-002 | P1 | Measure case generation latency using controlled provider responses and record external-provider latency separately. | Progress is visible during long-running generation. Timeouts and retries are bounded and documented. |
| PERF-003 | P1 | Load a case with maximum supported suspects, evidence items, and timeline entries. | The screen remains usable, lists render correctly, and the API applies documented pagination or limits where needed. |
| PERF-004 | P1 | Run repeated generation and investigation flows while monitoring errors and memory usage. | No progressive degradation, unbounded polling, runaway retries, or unhandled promise rejections. |
| PERF-005 | P2 | Simulate a slow connection and high latency. | Loading indicators and timeouts are understandable; the UI remains responsive and avoids duplicate actions. |

## 10. Release gate

The release is accepted only when all of the following are true:

- [ ] All P0 tests pass.
- [ ] All P1 tests pass or have a formally approved exception with an owner and target date.
- [ ] No unresolved critical/high security issue remains.
- [ ] No unresolved critical/serious accessibility violation remains without an approved exception.
- [ ] End-to-end privacy tests confirm that canonical solution data stays server-side until authorized reveal.
- [ ] API and database implementation match `API.md` and `DATA_MODEL.md`, or the documents have been updated and reviewed.
- [ ] Production build and core smoke tests pass in the target deployment environment.
- [ ] Visual regressions have been reviewed at mobile, tablet, laptop, and desktop sizes.
- [ ] Test evidence and known limitations are recorded.

## 11. Test report template

Use one row per test case.

| Field | Value |
|---|---|
| Test ID | |
| Result (PASS / FAIL / BLOCKED / NOT RUN) | |
| Build / commit | |
| Environment | |
| Browser and version | |
| Viewport | |
| Test account / seed data reference | |
| Steps executed | |
| Expected result | |
| Actual result | |
| Evidence link or artifact | |
| Defect / issue ID | |
| Tester and date | |

## 12. Definition of done

A feature is complete only when its acceptance tests are executable and pass in the relevant environment, loading/empty/error/success states are covered, keyboard and responsive behavior are verified, authorization and private-data boundaries are tested at the API layer, and documentation reflects the implemented behavior. A green unit-test suite alone does not establish acceptance.
