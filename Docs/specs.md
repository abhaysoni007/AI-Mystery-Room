# AI Mystery Room
## Product Specification & Single Source of Truth (SSOT)

**Document version:** 1.1.0  
**Project type:** AI-powered interactive mystery investigation platform  
**Stack baseline:** React, Vite, Node.js, Express, MongoDB, Mongoose  
**AI provider:** Google Gemini, accessed only from the backend  
**Primary implementation consumer:** Coding agents and project contributors  
**Status:** Updated product and implementation specification  
**Authority:** This document defines product intent and core behavior. `API.md`, `DATA_MODEL.md`, `DESIGN_SPEC.md`, `USER_FLOWS.md`, `SYSTEM_DESIGN.md`, `ACCEPTANCE_TESTS.md`, `AI_DEVELOPMENT_RULES.md`, and `FEATURE_DELIVERY_WORKFLOW.md` provide detailed supporting contracts and procedures.

If this document conflicts with a supporting document, do not silently choose one. Identify the conflict, propose a minimal resolution, and update the relevant documents together before or alongside implementation.

---

# 1. Product overview

## 1.1 Product name

**AI Mystery Room**

## 1.2 Product vision

AI Mystery Room is a fictional detective game in which players investigate coherent, AI-assisted cases by examining evidence, comparing statements, reconstructing timelines, building theories, identifying contradictions, and submitting an evidence-based accusation.

The product must feel like a playable investigation, not a chatbot that writes a crime story. The player should actively reason about evidence rather than only read generated text.

## 1.3 Product principles

1. **The mystery has a fixed truth.** The culprit, motive, method, and event sequence are established before the case becomes playable. Ordinary gameplay must never change the canonical solution.
2. **Evidence drives gameplay.** Players must be able to inspect, compare, organize, connect, and reason about evidence.
3. **Each case has its own atmosphere.** The visual presentation and evidence formats can vary with the case setting and genre while navigation and core interaction patterns remain familiar.
4. **AI output is not trusted automatically.** Generated content must pass schema, reference, timeline, and consistency validation before it becomes playable.
5. **The server owns authoritative state.** Ownership, case lifecycle, private solution data, scoring, and accusation correctness are enforced by the backend.
6. **Readable code is a product requirement.** Prefer small, explicit, testable modules over unnecessary abstractions or premature infrastructure.
7. **One feature at a time.** Every feature must pass its applicable tests and quality checks before work proceeds to the next feature.

## 1.4 Target experience

A typical player should be able to:
1. Start a new mystery from a prompt or choose a provided case.
2. Enter a themed investigation workspace.
3. Inspect a case summary, suspects, timeline, and evidence library.
4. Open evidence artifacts such as fictional messages, receipts, witness statements, photographs, access logs, or surveillance records.
5. Place evidence on an interactive board and connect related clues.
6. Record theories and annotate contradictions.
7. Review their investigation and submit a final accusation.
8. Receive a satisfying explanation that links the canonical solution to evidence available during the case.
9. Save and resume an active investigation or start another case.

## 1.5 Core product differentiator

The intended experience combines:
- A logically consistent hidden solution.
- Interactive evidence artifacts rather than text-only clue lists.
- A visual board where players construct and revise their own reasoning.
- Case-specific visual atmosphere that supports the setting.
- A clear, evidence-based final reveal.

The evidence board and case themes are core product direction, but their commercial value must be validated with player testing. Do not claim product-market fit without evidence.

---

# 2. Scope and product goals

## 2.1 Version 1 goals

- Generate or load complete fictional mystery cases.
- Maintain a canonical solution and validate case consistency.
- Support authentication and private user-owned cases.
- Display multiple suspects, a timeline, and multiple evidence types.
- Implement an **Interactive Evidence Board** as the next core gameplay feature.
- Let players place evidence cards on the board, create and remove connections, label relationships, write theories, and mark contradictions.
- Persist board state and restore it when a player returns.
- Use a predefined, validated theme configuration for each case.
- Support responsive desktop, tablet, and mobile layouts.
- Support final accusation, deterministic server-side evaluation, and authorized solution reveal.
- Cover critical functionality with unit, integration, acceptance, and end-to-end tests.
- Keep the architecture suitable for scaling API instances and generation workers independently when measured load requires it.

## 2.2 Explicit non-goals for the initial release

Unless separately approved, do not build these as part of the first Evidence Board feature:
- Real-time multiplayer or collaborative editing.
- Public case marketplace or user-published cases.
- Fully explorable 3D worlds.
- Generated video for every case.
- Real-world police, criminal, messaging, or surveillance integrations.
- Real-person face recognition or identification.
- Cryptocurrency, NFTs, or blockchain mechanics.
- Subscription billing or payment processing.
- A general-purpose social network.
- A complex open-world map.
- AI agents that can alter the canonical solution during gameplay.

These may be considered after the single-player investigation experience has been tested with real users.

---

# 3. Technology and implementation constraints

## 3.1 Existing stack baseline

| Layer | Baseline | Responsibility |
|---|---|---|
| Frontend | React + Vite | User interface and investigation experience |
| Routing | Existing router; React Router if already selected | Navigation and route protection |
| Styling | Existing design system; Tailwind CSS if already configured | Responsive UI and shared tokens |
| Backend | Node.js + Express | REST API and domain services |
| Database | MongoDB + Mongoose | Users, cases, progress, board state, accusations, and metadata |
| AI | Google Gemini through a backend adapter | Structured mystery generation and optional assistance |
| Authentication | Secure server-validated session; HTTP-only cookies are the baseline | Authentication and authorization |
| Validation | Existing validation library; Zod or equivalent if appropriate | Request, persisted data, and AI-output validation |
| Testing | Existing test stack; Vitest, Supertest, and Playwright are acceptable choices | Unit, integration, and E2E tests |
| Source control | Git and GitHub | Version control and review |

Use JavaScript and JSX for new code unless the repository has already established TypeScript as its standard. Do not convert language, frameworks, package managers, or major dependencies as incidental cleanup.

**Repository-first rule:** inspect the actual repository, installed dependencies, scripts, conventions, and current implementation before changing files or assuming this stack is fully configured.

## 3.2 AI integration

- AI-provider keys remain server-side.
- Model names and provider settings come from validated environment configuration.
- Request structured output where supported.
- Validate every provider response at runtime.
- Use bounded timeouts, output limits, retries, and cost/concurrency limits.
- Normalize provider errors before returning them to the client.
- Do not put provider calls directly inside Express route handlers.
- Treat model output, user prompts, and evidence text as untrusted data.
- Do not log complete private solutions or sensitive prompts by default.
- Do not claim a generated image or video exists unless a real asset was created and stored. Provide honest fallbacks.

## 3.3 Architecture boundary

The application may remain a modular monolith with independently runnable generation workers. Do not introduce microservices, Redis, a new graph database, or a complex event system for the Evidence Board unless a measured requirement justifies it.

The backend is authoritative for:
- Authentication and ownership.
- Case lifecycle and canonical solution.
- Public/private serialization.
- Allowed evidence access.
- Board-state ownership and validation.
- Final accusation and scoring.
- Case completion and solution reveal.

The frontend is responsible for rendering and interactive editing of the board. It must not calculate the canonical culprit or expose hidden solution fields.

---

# 4. User roles

## 4.1 Guest

Guest play is optional. If supported, it requires an explicit secure session and access policy. Do not authorize access solely because a client supplies a case ID.

## 4.2 Registered user

A registered user can:
- Create an account and sign in.
- Create a case or start an available sample case.
- Access their own active and completed cases.
- Investigate suspects and evidence.
- Create and edit their own board state, theories, and annotations.
- Save and resume progress.
- Submit an accusation and view the authorized result.
- Delete their own cases where supported.

## 4.3 Administrator

A full administration interface is not required for the initial release. Operational logging, safe configuration, and controlled troubleshooting are still required.

---

# 5. Core functional requirements

## FR-01: Landing page

The landing page must explain that the product is an interactive fictional detective game. It should provide a primary action to start an investigation, a sample-case entry where available, a concise explanation of the gameplay, case previews, and basic footer/legal information.

Acceptance:
- The primary action leads to the create/select case flow.
- Initial content is readable without waiting for AI generation.
- The page works on supported mobile, tablet, and desktop widths.
- It does not claim to provide real criminal investigation services.

## FR-02: Mystery creation

Users can provide a fictional scenario and choose supported options.

Required:
- Scenario prompt, 20–2,000 characters after trimming.
- Difficulty: Easy, Medium, Hard.
- Category: fictional homicide, theft, disappearance, corporate espionage, cybercrime, blackmail, or general mystery.
- Investigation length: Short, Standard, Extended.

Optional settings may include:
- Setting or location type.
- Time period.
- Tone, such as suspenseful, noir, psychological, or lighthearted.
- Desired suspect count within validated limits.
- Case theme preference: Automatic, or a theme selected from the supported catalogue.

Defaults:
- Difficulty: Medium.
- Category: General mystery.
- Length: Standard.
- Suspects: 4.
- Theme: Automatic, chosen from case metadata and mapped to an approved theme preset.

Acceptance:
- Invalid prompts are rejected before provider calls.
- The user sees a real generation state.
- Duplicate submissions are prevented through UI safeguards and server-side idempotency where applicable.
- Failures are communicated clearly without losing the user's prompt.
- A successful generation navigates to the playable case only after validation and persistence succeed.

## FR-03: Case generation and the Truth Engine

A playable case must include:
- Stable case ID, title, category, difficulty, summary, and incident details.
- A canonical solution with culprit, motive, method, rationale, and event sequence.
- Stable suspect IDs and public suspect profiles.
- A coherent timeline.
- Evidence artifacts with stable IDs and type-specific content.
- Evidence-to-suspect and evidence-to-event references.
- Clue relationships, contradictions, and red herrings.
- Decisive evidence IDs and post-game explanations.
- A validated theme ID and theme configuration reference.
- Generation metadata that does not leak private solution data to the client.

### Generation principles

1. Establish the canonical truth before finalizing clues.
2. Build suspect knowledge, alibis, timeline events, and evidence from that truth.
3. Validate all identifiers and cross-references.
4. Validate chronology and domain-specific constraints.
5. Ensure the solution is supported by discoverable evidence.
6. Ensure red herrings have coherent explanations.
7. Keep public and private fields separate before serialization.
8. Reject, repair, or regenerate inconsistent output under bounded rules.
9. Do not make the player rely on an undisclosed fact for the intended solution.
10. Do not allow dialogue, hints, or themes to change the canonical solution.

A two-stage generation process—case planning followed by evidence construction—is the target design. A smaller prototype may use one structured generation call, but it must still perform the same validations before the case becomes playable.

### Initial difficulty guidelines

| Difficulty | Suggested size | Expected reasoning |
|---|---|---|
| Easy | 3 suspects, 5–7 evidence items | Clear clues and a short timeline |
| Medium | 4 suspects, 8–12 evidence items | Multiple evidence types and meaningful contradictions |
| Hard | 5–6 suspects, 12–18 evidence items | Cross-referencing and multiple plausible initial hypotheses |

These are configurable starting points, not fixed guarantees. Validate case quality and latency before increasing complexity.

## FR-04: Investigation workspace

The workspace is the central case experience. It must provide:
- Case title, summary, status, and progress.
- Suspect directory and suspect details.
- Evidence library with category filters.
- Evidence detail viewer appropriate to each evidence type.
- Timeline.
- Interactive Evidence Board.
- Investigation notes and theories.
- Final accusation action.
- Exit/dashboard navigation.

Desktop may use a multi-panel layout. Smaller screens should use responsive panels, tabs, drawers, or full-screen detail views. The user must not lose saved state when moving between views.

## FR-05: Suspect profiles

Each public suspect profile may include:
- Stable suspect ID, name, occupation, and appropriate background.
- Relationship to the incident.
- Stated alibi and public claims.
- Publicly known motive or apparent motive.
- Evidence references that the user is permitted to inspect.
- Portrait or other media when available.

Private knowledge, hidden motives, internal clue classifications, and solution details must not be included in ordinary suspect responses before the authorized reveal.

## FR-06: Evidence system

Support structured fictional evidence such as:
- Chat conversations and messages.
- Emails and documents.
- Images and photographs.
- Surveillance observations, simulated clips, or actual generated media when available.
- Forensic reports.
- Witness statements.
- Call logs, access-control logs, receipts, maps, audio transcripts, and financial records.

Each evidence item must have a stable ID, type, title, description, public content, timestamp/context, display order, related suspect IDs, related timeline event IDs, optional media reference, and integrity/context metadata. Read status belongs to user progress rather than being treated as globally shared case truth.

Internal clue classification may include decisive clue, supporting clue, red herring, or neutral evidence. These labels must not be disclosed during ordinary investigation.

Acceptance:
- Every evidence item belongs to one case.
- IDs and references are valid and unique in their intended scope.
- Evidence renders through a type-appropriate viewer.
- Missing optional media has an honest fallback.
- Evidence required to solve the case is discoverable through the intended gameplay flow.
- Evidence text is rendered safely as untrusted content.

## FR-07: Interactive Evidence Board — next core feature

### Purpose

Give players a visual workspace where they can construct and revise their own explanation by connecting suspects, evidence, timeline events, and theories. The board must support actual deduction, not merely decorative strings between cards.

### Initial scope

The first implementation must support:
1. Open a board associated with an authorized case.
2. Add an evidence item or suspect to the board from the existing case library.
3. Display cards with a clear type, title, and concise summary.
4. Move cards within the board and preserve their positions.
5. Create a connection between two placed items.
6. Choose a supported relationship label, such as supports, contradicts, places-at-time, links-to, or custom theory connection.
7. Add, edit, and delete a theory or annotation.
8. Mark a contradiction between two claims/evidence items and explain the reason in the player's own words.
9. Remove a connection or a card from the board without deleting the underlying case evidence.
10. Save changes and restore the same board state after navigation or refresh.
11. Reset or clear the board only after an explicit confirmation.
12. Navigate to the referenced evidence or suspect detail.
13. Work with keyboard-accessible controls as well as pointer interactions.
14. Reflow to a usable mobile layout, even if mobile uses a list/connection editor rather than freeform dragging.

### Data and behavior rules

- A board belongs to one user and one case.
- The initial policy is one persistent board per user per case.
- The board stores references to existing case evidence and suspects; it does not duplicate canonical evidence content.
- Board cards may store user-controlled position, display state, and optional user annotations.
- Connections must reference valid board item IDs.
- Theory and contradiction text is user-authored content and must be length-limited and safely rendered.
- Deleting a board card removes its board connections or handles them through a documented cleanup rule. It must not delete case evidence.
- Board state must never contain the canonical solution or hidden clue classifications.
- The server must validate ownership and referenced item IDs on every save.
- Client coordinates must be normalized or bounded so a malformed payload cannot create pathological documents.
- Saves must avoid silently overwriting newer changes. Use a version field or another explicit concurrency policy if concurrent editing is supported.
- A connection label describes the player's interpretation; it is not proof that the interpretation is correct.
- The UI must not color a player-created link as objectively correct/incorrect before the authorized reveal unless a clearly defined game mechanic explicitly provides that feedback.
- The board must remain usable when empty, when no evidence has been placed, and when the case contains long titles or many evidence items.

### Not included in the first board release

- Multiplayer live collaboration.
- AI-generated automatic deductions that modify the player's board without permission.
- Automatic revelation of decisive clues.
- Complex physics-based layouts.
- Infinite canvas or graph-scale optimization before actual use requires it.
- A separate database or graph database solely for board connections.

### Board acceptance summary

The user can add evidence, position it, connect it with a relationship label, record a theory, mark a contradiction, save, refresh, and recover the same board state. Unauthorized users cannot access or modify another user's board. The board does not leak hidden solution data. Core interactions work with keyboard and at mobile widths.

## FR-08: Case-specific visual themes

### Purpose

Each case should feel like entering a different investigative world. Theme variation must be driven by case metadata and approved design presets—not arbitrary AI-generated CSS or a separate hardcoded UI for each case.

### Shared product identity

Keep consistent across all cases:
- Product navigation and account controls.
- Core route behavior and interaction patterns.
- Board editing semantics.
- Accessibility expectations.
- Error, loading, save, and confirmation patterns.
- Core typography hierarchy and spacing rules where appropriate.

Allow the following to vary by case theme:
- Color tokens and accent colors.
- Background texture or ambient imagery.
- Evidence-card appearance and decorative framing.
- Approved typography preset.
- Iconography and small visual motifs.
- Optional, restrained atmospheric transitions or sounds if user-controlled and accessible.
- Evidence artifact presentation, such as archival documents, digital logs, railway tickets, or laboratory reports.

### Initial theme presets

The initial set should be small and extensible. Suggested presets:
- `noir`: restrained dark surfaces, muted cinematic accents, case-file styling.
- `archive`: paper, ink, and archival-document styling for historical cases.
- `digital_forensics`: structured logs, data panels, and cool technical accents.
- `luxury`: refined editorial presentation for hotels, estates, or high-society mysteries.
- `field_investigation`: practical evidence labels, maps, and field notes.

These names are examples. Inspect the existing design system and implement only presets that fit the repository and design direction.

### Theme configuration rules

- AI may suggest a theme ID and semantic tags, but the server validates the theme ID against an allowlist.
- Theme tokens are defined by the application, not generated as arbitrary CSS by the model.
- Unsupported or invalid theme IDs fall back to a safe default.
- Theme changes must not alter evidence facts, clue availability, case scoring, or the canonical solution.
- Theme styling must not reveal whether a clue is decisive or misleading.
- Every preset must meet contrast, keyboard focus, reduced-motion, and responsive requirements.
- Theme configuration is metadata on the case; it is not a separate codebase or separate page implementation.
- Keep the number of initial presets small. Add themes based on tested cases and clear visual needs, not simply to increase a feature count.

## FR-09: Investigation notes, theories, and contradiction annotations

Users can create, edit, and delete private notes. The Evidence Board should allow theories and contradiction annotations to be associated with relevant board items or connections.

Requirements:
- Notes and theories are scoped to the authenticated user and case.
- Text length and payload size are bounded.
- Saving feedback is clear.
- Recoverable failures preserve typed text where practical.
- Notes do not modify the canonical solution.
- User annotations are never presented as official case facts.
- Notes and theories are excluded from public case responses and from other users' sessions.

## FR-10: Optional investigation assistant

An assistant may help summarize already discovered evidence, compare claims, or offer progressive hints. It is not required for the board's core functionality.

If implemented:
- It may use only evidence the user is authorized to access.
- It must distinguish observed facts from interpretations.
- It must not invent evidence or change the canonical solution.
- It must not reveal the culprit during normal investigation.
- It must treat evidence and user text as untrusted content, not instructions that override system policy.
- Hint use and any resulting scoring effects must be explicit and deterministic.
- Core investigation must work if the assistant is unavailable.

## FR-11: Final accusation

The player selects a suspect and may provide reasoning or choose evidence supporting the conclusion. Before submission, show whether the action is final.

The server must:
1. Authenticate the user and verify case ownership.
2. Verify that the case is active and accusation rules permit submission.
3. Validate the selected suspect ID and any submitted board/evidence references.
4. Enforce the configured attempt policy.
5. Compare the selected suspect ID against the canonical culprit ID.
6. Calculate deterministic score fields.
7. Save the result and complete the case using a safe state transition.
8. Return only the fields permitted after completion.

Do not ask Gemini to determine whether the selected culprit is correct.

Initial scoring may use a simple correct/incorrect result. More detailed reasoning scores should be introduced only with a clear, testable rubric. Do not claim to assess reasoning quality if the system has no defined scoring rules.

## FR-12: Results and solution reveal

After an authorized final accusation, show:
- Correct/incorrect result.
- Actual culprit.
- Motive and method.
- Key timeline events.
- Decisive evidence and why it matters.
- Explanations for red herrings and contradictions.
- Why other suspects were less likely.
- Score and elapsed time if tracked.
- Actions to review the case or return to the dashboard.

The reveal must explain the answer using facts that were available to discover. The complete solution is accessible only after completion or through an explicitly authorized administrative path.

## FR-13: Dashboard and case history

Show active and completed cases, title, difficulty, theme, last activity, progress, and score where available. Users can resume active cases and revisit completed results. Case deletion must follow the documented retention policy and must not leave accessible orphaned private media or board data.

---

# 6. Canonical case contract and validation

## 6.1 Conceptual case structure

The full production schema is defined in `DATA_MODEL.md`. At minimum, a case includes:
- Public metadata: title, category, difficulty, summary, incident description, theme ID.
- Public entities: suspects, timeline, evidence artifacts, allowed relationships.
- Private solution: culprit ID, motive, method, rationale, decisive evidence IDs, red-herring explanations, and consistency metadata.
- Generation metadata: provider/model/version and validation status, with private details kept server-side.
- Lifecycle status: generating, active, completed, or failed.

## 6.2 Validation requirements

Before activating a case, validate:
- Required fields and type-specific evidence schemas.
- Unique identifiers and valid references.
- Suspect count and evidence count bounds.
- Valid timestamps and timeline ordering.
- Culprit references an existing suspect.
- Decisive evidence references exist and are accessible during the intended flow.
- Every intended conclusion has adequate support.
- Red herrings have explanations.
- No required conclusion depends solely on an undisclosed fact.
- Theme ID is supported by the theme registry.
- Public fields contain no canonical solution or hidden clue classifications.
- Content is bounded and safe to render.
- Case status changes to active only after validation and persistence succeed.

Schema-valid JSON does not guarantee a logically sound mystery. Use deterministic structural checks and a controlled consistency-review step where useful. Do not use an AI review response as the sole authority for correctness.

---

# 7. Frontend requirements

## 7.1 Routes

Adapt to the existing repository. Suggested routes:
- `/` — landing page.
- `/create` — create a case.
- `/login` and `/register` — authentication.
- `/dashboard` — personal case list.
- `/case/:caseId` — investigation workspace.
- `/case/:caseId/evidence/:evidenceId` — evidence detail.
- `/case/:caseId/board` — board route or view, if routing separately improves the current application.
- `/case/:caseId/accuse` — accusation.
- `/case/:caseId/result` — authorized result.
- `/profile` — account settings.

Do not introduce a separate route when the current route/view architecture supports the feature cleanly. Every protected route must still enforce server authorization.

## 7.2 Reusable components

Reuse existing components where possible. Candidate components include:
- `CaseHeader`, `CaseCard`, `CaseThemeProvider`.
- `SuspectCard`, `SuspectProfile`.
- `EvidenceCard`, `EvidenceFilter`, `EvidenceViewer`.
- `Timeline`.
- `EvidenceBoard`, `BoardCanvas`, `BoardItem`, `BoardConnection`, `ConnectionEditor`.
- `TheoryEditor`, `ContradictionAnnotation`.
- `InvestigationNotes`.
- `LoadingState`, `ErrorState`, `EmptyState`, `ToastNotification`.
- `AccusationDialog`, `ResultSummary`.

These are conceptual responsibilities, not a mandate to create every component as a separate file. Keep modules cohesive and avoid excessive abstraction.

## 7.3 Design and interaction rules

- Follow `DESIGN_SPEC.md` for shared design tokens and component conventions.
- Keep navigation and core interaction patterns consistent across cases.
- Apply the case theme through validated theme tokens.
- Do not use color alone to distinguish status or relationship type.
- Provide visible keyboard focus and semantic controls.
- Support reduced-motion preferences.
- Use pointer interactions as an enhancement, not the only way to manipulate the board.
- Keep loading, saving, empty, success, and failure states explicit.
- Avoid unnecessary animation, decorative complexity, and layout shifts.
- Do not ship dead buttons, placeholder links, fake progress, or unimplemented actions.
- Ensure long case names, long evidence content, and small screens do not break the layout.

---

# 8. API and persistence contracts

`API.md` defines exact endpoints, request/response schemas, error envelopes, authorization rules, and status codes. `DATA_MODEL.md` defines MongoDB schemas, indexes, lifecycle, and serialization boundaries. Update those documents before or alongside implementation when this specification introduces a contract change.

The Evidence Board will require backend operations to:
- Retrieve the authenticated user's board for an authorized case.
- Create or update board state.
- Validate placed item references against public case entities.
- Validate connection endpoints and relationship types.
- Persist theories and contradiction annotations.
- Support safe reset/clear behavior if approved.
- Return the saved version/state to the client.

Use existing endpoint naming conventions where possible. Do not invent a parallel API style or silently change established response envelopes.

The API must enforce:
- Authentication and ownership on every board operation.
- Maximum item, connection, annotation, and payload sizes.
- Valid IDs and allowed relationship types.
- Safe handling of stale or malformed state.
- Explicit concurrency/version behavior where needed.
- Public/private serialization that excludes the canonical solution.
- Stable error codes and safe user-facing messages.

---

# 9. Security and privacy requirements

Security is mandatory.

- Hash passwords with a maintained password-hashing library; never store plaintext passwords.
- Use secure HTTP-only cookies for cookie-based sessions and apply CSRF protection where required by the selected deployment model.
- Enforce ownership on every case, evidence, board, note, result, and media operation.
- Never trust a case ID, suspect ID, evidence ID, role, score, or completion state supplied by the client without validation.
- Keep provider keys and database credentials server-side.
- Validate and bound all request bodies, path/query parameters, text fields, and media.
- Apply rate limits to authentication, generation, and other abuse-prone endpoints.
- Configure CORS for known origins, security headers, request-size limits, and safe error handling.
- Treat AI output as untrusted input; validate and render it safely.
- Keep canonical solution fields, private clue classifications, raw prompts containing solution details, and answer-bearing metadata out of pre-completion responses.
- Keep private media in private storage with authorized delivery or short-lived signed URLs.
- Do not log passwords, tokens, full private solutions, or unnecessary personal data.
- Keep user-created notes, theories, and board state private to their owner.
- Test cross-user access and solution non-disclosure through direct API/network requests, not just the visible UI.

---

# 10. Error handling and resilience

Handle at least:
- Invalid scenario input.
- Authentication failure and expired session.
- Unauthorized case or board access.
- Missing case, evidence, or board item.
- Invalid or oversized board state.
- Conflicting or stale board updates.
- AI provider timeout, rate limit, outage, and malformed output.
- Database connection or write failure.
- Missing media.
- Duplicate accusation.
- Network interruption.
- Failed board save and failed reset.

Expected errors must use the documented API envelope. Do not return stack traces, secrets, database internals, raw provider responses, or private solution data. Preserve unsaved user input where practical and provide a clear retry path.

---

# 11. Testing requirements

The full checklist is in `ACCEPTANCE_TESTS.md`. The following checks are required for the Interactive Evidence Board.

## 11.1 Unit tests

Test:
- Board state validation.
- Valid and invalid item references.
- Connection endpoint validation.
- Allowed relationship types.
- Card position normalization and bounds.
- Theory and annotation validation.
- Removal/cleanup rules for board items and connections.
- Public/private serialization.
- Theme ID validation and fallback.
- Ownership and authorization helpers where unit-testable.

## 11.2 Integration tests

Test:
- Retrieving and saving board state for an authorized owner.
- Rejection of another user's case or board.
- Persistence across API requests and reload.
- Invalid evidence/suspect IDs.
- Oversized or malformed board payloads.
- Stale-version/conflicting updates if versioning is implemented.
- Board reset behavior.
- Case deletion and related board-state cleanup.
- No solution or hidden clue labels in public responses.

## 11.3 End-to-end tests

A core board journey must:
1. Open an active case.
2. Add at least two evidence items and one suspect to the board.
3. Move an item and create a labeled connection.
4. Add a theory and annotate a contradiction.
5. Navigate away and return or refresh.
6. Verify that the board state is restored.
7. Remove a connection or board item and verify the documented behavior.
8. Verify the board remains usable at a narrow mobile viewport.
9. Verify keyboard-accessible alternatives for core interactions.
10. Verify that the browser's network responses do not expose private solution fields.

Use stable fixtures and deterministic data. Do not rely on a live AI provider for routine board tests.

## 11.4 AI quality tests

Evaluate generated cases separately for:
- Schema compliance.
- Timeline consistency.
- Evidence relevance.
- Valid references.
- Decisive clue availability.
- Red-herring explanations.
- Theme metadata validity.
- Solution non-disclosure.
- Overall solvability and appropriate difficulty.

AI-generated output must not be the only test oracle for deterministic game behavior.

---

# 12. Performance and scalability

The system should be designed for growth toward 10,000 registered users, but capacity must be demonstrated through load testing rather than inferred from the user count.

- Keep API instances stateless and horizontally scalable.
- Bound board payload sizes, card counts, connections, and text lengths.
- Store board state in the existing database initially; do not add a graph database solely for this feature.
- Avoid saving the entire board on every pointer movement. Debounce or batch position updates and provide explicit save/dirty-state behavior where appropriate.
- Avoid unbounded polling, full-document over-fetching, and repeated unnecessary requests.
- Add indexes based on verified query patterns.
- Keep AI generation separate from normal API latency using a durable job/worker design when needed.
- Track request latency, error rates, database saturation, generation queue age, and provider usage.
- Validate the workload through staging load tests with realistic case and board sizes.
- Define explicit performance targets and record measured results.

See `SYSTEM_DESIGN.md` for workload modelling, deployment, queue processing, observability, backups, and scaling stages.

---

# 13. Implementation workflow — mandatory

**Implement one feature at a time. Do not move to the next feature until the current feature has passed its required checks.**

For each feature:
1. Read the relevant project documents and inspect the existing repository.
2. Define acceptance criteria and identify impacted contracts.
3. Implement the smallest complete feature slice.
4. Run unit tests.
5. Run integration tests for the affected boundaries.
6. Run applicable end-to-end/acceptance tests.
7. Run relevant lint, typecheck, and build checks.
8. Fix failures and rerun the affected checks.
9. Review the diff for regressions, security risks, complexity, dead code, and unrelated changes.
10. Update the relevant documentation and record actual test results.
11. Mark the feature DONE only after its completion gate passes.
12. Start the next feature.

If a required check fails, stop and fix it. If a check cannot run due to an environment blocker, mark the feature BLOCKED and document the reason; do not call it passed. Any exception requires explicit approval and must document the unverified risk.

Follow `FEATURE_DELIVERY_WORKFLOW.md` and `AI_DEVELOPMENT_RULES.md` for the full procedure.

## 13.1 Suggested next feature sequence

The current next feature is **Interactive Evidence Board**. Do not start the next item until the current feature passes its completion gate.

1. **Board state and basic interactions:** place evidence/suspect cards, move them, create/remove connections, and save/restore state.
2. **Theories and contradictions:** add/edit/delete user-authored theories and contradiction annotations.
3. **Case theme presets:** apply validated theme configuration to the board and case workspace; if theme infrastructure is required by the first board implementation, implement the minimal necessary part in that same feature scope.
4. **Enhanced deduction and verdict flow:** connect board reasoning to accusation UI only after the base board is stable.
5. **Retention features:** daily cases, progression, or other features only after user testing supports them.

This is a suggested sequence, not permission to bundle unrelated work. Each item must be independently scoped and verified.

---

# 14. Project structure and repository rules

Inspect the existing repository before creating or moving files. Preserve established conventions where they work.

A possible organization for a repository already using a client/server split:

```text
client/
  src/
    features/
      auth/
      dashboard/
      mystery/
      investigation/
      evidence/
      evidence-board/
      accusation/
    components/
    services/
    hooks/
    context/
    utils/

server/
  src/
    config/
    middleware/
    models/
    routes/
    controllers/
    services/
      ai/
      mystery/
      evidence/
      investigation/
      evidence-board/
    validators/
    utils/
  tests/

docs/
  SPEC.md
  DESIGN_SPEC.md
  USER_FLOWS.md
  API.md
  DATA_MODEL.md
  ACCEPTANCE_TESTS.md
  SYSTEM_DESIGN.md
  AI_DEVELOPMENT_RULES.md
  FEATURE_DELIVERY_WORKFLOW.md
```

This is a conceptual guide, not a mandate to reorganize a working repository. Use the smallest change consistent with the current architecture.

---

# 15. Definition of done

The product is not complete merely because screens render. A release requires:
- [ ] The user can create or open a valid mystery case.
- [ ] A playable case has a predetermined canonical solution.
- [ ] The backend validates the case before activation.
- [ ] Suspects, evidence, and timeline references are consistent.
- [ ] The user can inspect multiple evidence types.
- [ ] The Interactive Evidence Board supports adding, positioning, connecting, and removing board items.
- [ ] The user can record theories and annotate contradictions.
- [ ] Board state persists and restores accurately.
- [ ] Board data is private to its owner and case.
- [ ] Case themes use validated presets and do not alter game truth.
- [ ] Accusation correctness is determined server-side.
- [ ] The solution is revealed only after authorized completion.
- [ ] The UI is responsive and keyboard-accessible for core interactions.
- [ ] Loading, empty, error, and missing-media states are handled.
- [ ] Relevant unit, integration, and E2E tests pass.
- [ ] Security-sensitive APIs are tested for authorization and solution leakage.
- [ ] Required build and static checks pass.
- [ ] Documentation matches the implemented behavior.
- [ ] Known limitations and unverified checks are reported honestly.

---

# 16. Mandatory instructions for coding agents

1. Read this specification and the relevant supporting documents before implementation.
2. Inspect the actual repository, package scripts, dependencies, and current behavior before editing.
3. Treat this file as the product source of truth, but keep detailed API, data, design, flow, and test contracts synchronized with their supporting documents.
4. Follow `AI_DEVELOPMENT_RULES.md` and `FEATURE_DELIVERY_WORKFLOW.md`.
5. Implement one feature at a time; do not proceed until the current feature's required unit, integration, acceptance/E2E, and quality checks pass.
6. Do not invent endpoints, fields, routes, components, scripts, or dependencies without inspecting the code and contracts.
7. Do not implement unrelated features without approval.
8. Do not expose the culprit, private solution, hidden clue labels, or answer-bearing metadata before authorized reveal.
9. Do not use AI to determine accusation correctness when deterministic comparison is sufficient.
10. Do not trust AI-generated content until schema and semantic validation pass.
11. Do not create arbitrary AI-generated CSS. Use validated theme IDs and application-defined tokens.
12. Do not ship mock data or fake progress in production paths.
13. Do not swallow exceptions, suppress valid failing tests, or claim tests passed when they were not run.
14. Do not add complexity or infrastructure without a clear requirement.
15. Do not leave dead controls, placeholder handlers, debug output, or unrelated changes.
16. Update affected documents when behavior, API, schema, design, or security boundaries change.
17. If requirements conflict or are ambiguous, report the conflict and choose the smallest safe, reversible resolution after documenting it.
18. At the end of each feature, report changed files, behavior implemented, tests actually run and results, known issues, and whether the completion gate passed.

---

# 17. Initial product decisions

| Decision | Baseline |
|---|---|
| Product | AI Mystery Room |
| Frontend | React + Vite, subject to repository inspection |
| Backend | Node.js + Express, subject to repository inspection |
| Database | MongoDB + Mongoose, subject to repository inspection |
| AI provider | Google Gemini through a backend adapter |
| Language | Preserve repository convention; JavaScript is the default for new code unless TypeScript is already established |
| Core gameplay | Single-player |
| Case creation | User-provided scenario and/or available curated cases |
| Canonical solution | Fixed before investigation |
| Evidence | Structured fictional artifacts |
| Core gameplay feature | Interactive Evidence Board |
| Board state | User-owned and persisted per case |
| Case themes | Validated application-defined theme presets |
| Accusation | Deterministic server-side comparison |
| Reveal | Authorized after case completion |
| Media | Stored securely; missing assets have honest fallbacks |
| Testing | Unit, integration, and Playwright E2E where appropriate |
| Scaling | Validate with realistic load tests; do not claim capacity without evidence |

---

# 18. Final product principle

**AI creates the mystery. The backend preserves the truth. The evidence board lets the player build a theory. The player discovers the truth through evidence.**

The intended result is a coherent detective game in which the user actively investigates, compares clues, tests theories, identifies contradictions, and reaches a defensible conclusion—not a chatbot that generates a story and invents an answer at the end.

**End of Specification — Version 1.1.0**
