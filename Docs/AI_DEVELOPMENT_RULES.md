# AI_DEVELOPMENT_RULES.md — Engineering Rules for AI-Assisted Changes

**Purpose:** Keep AI-assisted contributions to AI Mystery Room accurate, secure, maintainable, human-readable, and consistent with the project documentation. These rules apply to coding agents, IDE assistants, code-generation tools, and human contributors reviewing AI-generated changes.

## 1. Source of truth

Before proposing or changing code, inspect the existing repository and read the relevant project documents:

- `SPEC.md` — product scope and requirements.
- `DESIGN_SPEC.md` — visual system and UI conventions.
- `USER_FLOWS.md` — expected journeys and navigation.
- `API.md` — HTTP methods, endpoints, request/response schemas, status codes, and security boundaries.
- `DATA_MODEL.md` — persistence model, indexes, ownership, lifecycle, and public/private fields.
- `ACCEPTANCE_TESTS.md` — observable requirements and release checks.
- `SYSTEM_DESIGN.md` — scalability, reliability, deployment, and operational design.

If a file is missing, stale, or conflicts with the code, identify the discrepancy explicitly. Do not invent undocumented requirements or silently choose a conflicting interpretation. Propose the smallest coherent resolution and update the relevant documentation when a contract changes.

The repository's existing conventions are also important. Inspect `package.json`, lockfiles, lint/format configuration, folder structure, environment examples, existing components, tests, and recent patterns before adding a new library or architecture.

## 2. Core engineering principles

1. **Correctness before cleverness.** Choose the simplest design that meets the requirement and has clear failure behavior.
2. **Small, reviewable changes.** Make focused changes with a clear purpose. Avoid unrelated refactors in feature work.
3. **Readable by a junior developer.** Prefer explicit names, straightforward control flow, small functions, and predictable data flow.
4. **No invented infrastructure.** Do not add queues, caches, services, frameworks, or dependencies without a concrete need and an explanation of operational cost.
5. **Preserve existing behavior.** Understand callers and contracts before changing shared code.
6. **Secure by default.** Enforce authorization and validation on the server; do not rely on frontend hiding.
7. **Test observable behavior.** Add tests for requirements and regression risks, not tests that merely mirror implementation details.
8. **Explain trade-offs.** When a decision affects security, cost, performance, or maintainability, state the reason briefly in the pull request or implementation summary.
9. **No false completion claims.** Never say tests, builds, deployments, or manual checks passed unless they were actually run and their results were observed.
10. **Avoid unnecessary abstraction.** Do not build a generic framework for a single simple use case. Introduce abstractions when they remove real duplication or isolate a genuine boundary.

## 3. Required workflow for every task

1. Restate the requested outcome and identify affected user flows, API contracts, data models, and acceptance-test IDs.
2. Inspect the current implementation and related tests before editing.
3. Identify assumptions, missing information, migration risks, and security-sensitive fields. Ask a focused question only when a decision is necessary to proceed safely; otherwise state a reasonable, reversible assumption.
4. Write a short implementation plan for non-trivial work. Keep the plan proportional to the task.
5. Implement the smallest complete change that satisfies the requirement.
6. Add or update unit, integration, and end-to-end tests appropriate to the change.
7. Run relevant formatting, linting, typechecking, tests, and production build using the repository's existing scripts.
8. Review the diff for unrelated edits, dead code, leaked secrets, unsafe data exposure, missing error handling, and undocumented contract changes.
9. Update documentation and environment examples if behavior, configuration, schema, or API contracts changed.
10. Summarize files changed, behavior delivered, commands run with actual results, known limitations, and any manual verification still needed.

Do not skip repository inspection and immediately generate an entire subsystem from assumptions.

## 4. Code quality and readability

- Use descriptive names that express intent. Prefer `caseOwnerId` over `id2`, and `isGenerationPending` over ambiguous booleans.
- Keep functions focused on one coherent task. Extract a helper when it clarifies logic, removes meaningful duplication, or makes a boundary testable.
- Prefer guard clauses and explicit branches over deeply nested conditionals.
- Avoid deeply nested ternaries, clever one-liners, unexplained abbreviations, and excessively generic names such as `data`, `item`, `result`, or `handler` when a domain name is available.
- Keep modules cohesive. Do not create giant components, service files, or utility modules that own unrelated behavior.
- Avoid duplicated business rules. Centralize validation, authorization, serialization, and domain rules at the appropriate layer.
- Keep business logic out of presentation components where it makes behavior difficult to test. Keep components focused on rendering and user interaction.
- Avoid both extremes: do not duplicate substantial logic, and do not create abstractions for trivial repeated expressions.
- Use comments to explain **why** a non-obvious decision exists, not to narrate each line.
- Do not add redundant comments, decorative banners, TODOs without an owner or reason, or generated documentation that simply repeats the code.
- Do not leave unused imports, unreachable branches, abandoned experiments, debug prints, commented-out implementations, or placeholder handlers.
- Use constants for meaningful domain limits and configuration, not for every literal.
- Prefer immutable data transformations where they improve clarity; do not add complex state-management patterns without a demonstrated need.
- Handle null/undefined and empty states intentionally. Do not silence type errors with broad casts or unchecked non-null assertions just to make the build pass.
- Keep functions and types close to where they are used until there is a clear reason to share them.
- Match the repository's formatting and naming conventions; do not reformat unrelated files.

## 5. JavaScript and TypeScript rules

Follow the language already used by the affected area. Do not convert JavaScript to TypeScript or the reverse without explicit approval.

- Respect the project's configured runtime and module system.
- Use `async`/`await` consistently for asynchronous workflows and handle rejected promises.
- Do not use floating promises, fire-and-forget operations, or swallowed exceptions for critical writes or security checks.
- Avoid broad `catch` blocks that return success-shaped defaults. Handle errors at the layer that can respond appropriately.
- Validate external data at runtime, even if a TypeScript type exists; compile-time types do not validate HTTP or AI-provider payloads.
- Avoid `any`, unsafe casts, and duplicate type definitions where a shared contract is practical.
- Do not expose internal exceptions, stack traces, secrets, or raw provider responses to clients.
- Do not introduce a new state library, validation library, ORM, or HTTP client without checking existing dependencies and explaining the benefit.
- Do not use arbitrary timeouts to hide race conditions. Fix the state transition or synchronization problem.

## 6. Frontend and design-system rules

- Follow `DESIGN_SPEC.md` and existing shared design tokens and components. Reuse established Button, Input, Select, Textarea, dialog, alert, and layout primitives where suitable.
- Do not introduce arbitrary colors, spacing values, font families, border radii, shadows, or one-off component styles when an existing token fits.
- Build for loading, success, empty, error, and disabled states, not only the happy path.
- Every visible control must perform its stated action. Do not ship dead buttons, placeholder links, fake progress, or interactions that only change local appearance without completing the required operation.
- Use semantic HTML and accessible names. Prefer buttons for actions and links for navigation.
- Ensure forms work with keyboard and browser autofill where appropriate; show field-level validation and preserve user input after recoverable failures.
- Avoid unnecessary animations, layout shifts, giant components, and effects that duplicate server state.
- Do not store secrets or authoritative domain rules in frontend code.
- Use explicit loading and error behavior. Avoid unbounded polling and duplicate API requests.
- Make responsive behavior intentional at narrow widths and test long text, missing images, zoom, and mobile keyboard interactions.
- Use stable keys for rendered collections and do not suppress React warnings without fixing the underlying cause.
- Do not use generated or decorative imagery as a substitute for a functional product requirement.

## 7. Backend, API, and data rules

- Treat `API.md` and `DATA_MODEL.md` as contracts. If implementation and docs disagree, flag and resolve the mismatch.
- Validate request bodies, path/query parameters, content types, and payload sizes at the server boundary.
- Enforce authentication, ownership, and role/permission checks on every private operation. Verify the resource belongs to the authenticated user before reading or mutating it.
- Return explicit DTOs/public serializers, never raw database documents by default.
- Keep HTTP status codes and error envelopes consistent. Use stable error codes for expected failures and safe messages for users.
- Add database indexes for verified query patterns and enforce critical uniqueness rules in the database as well as application logic.
- Use transactions only where supported and needed; otherwise design recoverable state transitions.
- Add pagination and maximum limits to potentially unbounded lists and queries.
- Avoid N+1 database calls, full collection scans, unbounded embedded arrays, and fetching binary media through JSON APIs.
- Make writes idempotent where clients may retry. Use a database constraint or durable idempotency record for critical uniqueness requirements.
- Never trust a client-calculated accusation result, score, ownership claim, role, or case-completion status.
- Keep secrets in environment configuration or a secret manager. Update `.env.example` with variable names and safe placeholders only; never commit real credentials.
- Do not make destructive schema or data changes without a migration, compatibility plan, backup consideration, and rollback/forward-recovery strategy.
- Avoid silently changing API response shapes, database field meanings, or error semantics.

## 8. AI integration and mystery integrity

- Treat every AI-provider response as untrusted external input.
- Validate generated content against a strict runtime schema; validate cross-references and domain invariants after schema validation.
- Keep the canonical culprit, solution, private motive/method/rationale, hidden clue classifications, scoring logic, raw prompts, and answer-bearing metadata on the server until the authorized reveal.
- Never send private solution data to the browser and merely hide it with CSS, state, or conditional rendering.
- Do not let model output execute code, select privileged tools, set ownership, change permissions, construct arbitrary internal URLs, or bypass validation.
- Set request timeouts, output/token limits, per-user quotas, global concurrency bounds, and explicit cost limits.
- Handle provider timeouts, rate limits, malformed output, content-policy failures, and unavailable providers as distinct cases where behavior differs.
- Retry only eligible transient failures with bounded exponential backoff and jitter. Avoid retry storms and duplicate case creation.
- Use idempotent job processing and recover stuck jobs after worker crashes.
- Keep raw prompts, full model output, private solutions, and personal data out of ordinary logs. Use redacted diagnostics and restricted debugging paths when necessary.
- Never fabricate AI-provider success or claim a case is playable until server-side validation and persistence have succeeded.
- Ensure deterministic tests use a mock/fake provider; use controlled real-provider tests separately.
- If model output is inconsistent, reject or regenerate it according to a bounded policy; do not silently patch important mystery logic in the frontend.

## 9. Security, privacy, and abuse resistance

- Use a threat-aware approach to authentication, authorization, input validation, output encoding, rate limiting, and logging.
- Never trust a resource ID supplied by the client as proof of ownership.
- Avoid logging passwords, access tokens, cookies, private notes, complete prompts, canonical solutions, or unnecessary personal data.
- Apply stricter rate limits to registration, login, generation, password recovery, uploads, and accusation endpoints as applicable.
- Ensure CORS is allowlisted for the deployed architecture. Configure cookie flags and CSRF protection according to the chosen authentication model.
- Restrict uploads by size, content type, and actual file validation; keep private media in private storage and use authorized delivery or short-lived signed URLs.
- Render user- and AI-generated text safely. Sanitize only where appropriate for the output context; prefer text rendering over injecting raw HTML.
- Use least-privilege credentials for the database, queue, object storage, and deployment platform.
- Do not add analytics or telemetry that captures sensitive content by default.
- Test object-level authorization and private-solution boundaries at API level, including direct requests that bypass the UI.
- Avoid home-grown cryptography and authentication primitives. Use well-maintained libraries and platform features.
- Document new security assumptions and failure modes.

## 10. Scalability and performance rules

Follow `SYSTEM_DESIGN.md`. Do not optimize by guesswork.

- Keep API processes stateless so replicas can be added safely.
- Do not run slow AI generation synchronously in a request handler if it can exceed the API's latency/time limits; use a durable job and worker pattern.
- Set explicit timeouts for database, HTTP, AI-provider, and storage operations.
- Bound concurrency, payload sizes, generated content sizes, retries, polling frequency, and list sizes.
- Measure query plans and request latency before adding indexes or caches.
- Do not add Redis, microservices, sharding, complex event systems, or multiple abstractions solely to claim scalability.
- Use caches only with an explicit key, TTL, invalidation plan, and authorization boundary. Never place private responses in a shared cache.
- Track queue depth, oldest job age, provider quota usage, error rates, database connections, and p95/p99 latency.
- Design graceful shutdown and job recovery. A restart must not silently discard accepted work.
- Load-test realistic read and generation workloads separately; record measured results rather than promising capacity based on architecture alone.

## 11. Testing rules

- Every bug fix should include a regression test when practical.
- Every new user-visible behavior should have tests at the most appropriate layer.
- Test behavior, boundaries, errors, and permissions—not only the happy path.
- Cover success, loading, empty, invalid-input, unauthorized, not-found, provider-failure, timeout, and duplicate-request cases where relevant.
- Use `ACCEPTANCE_TESTS.md` to identify affected checks and release blockers.
- Prefer deterministic fixtures and seeded data. Do not depend on a live AI provider for routine unit or CI tests.
- Test private solution non-disclosure by inspecting raw API/network responses, not only rendered text.
- Test two users to prove case, progress, notes, accusation, and media isolation.
- Avoid brittle tests that depend on implementation details, arbitrary sleeps, random generated content, or unstable selectors.
- Use accessible role/name selectors in browser tests where practical.
- Do not weaken or delete a failing test merely to make CI green. If a test is invalid, explain why and replace it with a valid assertion.
- Report tests that could not run and the reason. Do not claim a pass based on code inspection alone.

## 12. Dependencies and tooling

- Prefer existing dependencies and platform APIs.
- Before adding a dependency, verify that it is actively maintained, compatible with the runtime, appropriately licensed for the project, and materially reduces risk or complexity.
- Explain the need for substantial new dependencies in the implementation summary.
- Do not add overlapping libraries for the same task without a reason.
- Pin versions through the project's package manager and commit the lockfile when appropriate.
- Do not change package managers or major framework versions as incidental cleanup.
- Do not disable lint, typecheck, security scans, or build checks to get a change merged.
- Never add secrets, personal tokens, production data, or generated build artifacts to version control.

## 13. Error handling and observability

- Handle expected errors at the appropriate boundary and return safe, consistent messages.
- Do not silently ignore failed writes, rejected promises, failed queue jobs, or authorization errors.
- Do not return success-shaped fallback data when the operation failed.
- Use structured logs and correlation/request IDs for multi-step operations.
- Avoid excessive logging, sensitive payloads, and noisy logs that hide meaningful failures.
- Add metrics or diagnostic context when introducing a new critical asynchronous workflow.
- Ensure user-facing errors state what happened and what the user can do next without revealing internals.

## 14. Documentation and configuration

- Update the relevant Markdown document when API, data model, user flow, visual system, security boundary, deployment, or acceptance behavior changes.
- Document new environment variables in `.env.example` and setup instructions with safe placeholder values.
- Keep README instructions executable and aligned with actual scripts.
- Document non-obvious operational procedures: migration, backup restore, job replay, and deployment rollback when affected.
- Avoid redundant documents that contradict the source of truth.
- Do not claim a feature is implemented because it appears in a plan or documentation.

## 15. Git and pull-request hygiene

- Keep each change focused and use a commit message that states the outcome.
- Do not overwrite unrelated user changes or reset branches without explicit approval.
- Review `git diff` and `git status` before committing or reporting completion.
- Do not include `.env`, credentials, local database dumps, generated artifacts, or unrelated formatting changes.
- A pull request summary should state: problem, solution, notable design choices, tests run and results, documentation updated, risks, and follow-up work.
- Mark any incomplete implementation, temporary workaround, or known limitation clearly.
- Avoid claiming that a change is production-ready if required load, security, accessibility, or acceptance tests have not run.

## 16. Prohibited shortcuts

Do not:

- Invent APIs, database fields, environment variables, routes, components, or scripts without checking the repository and contracts.
- Return hardcoded mock data from production paths to make the UI appear complete.
- Use fake progress indicators that imply work is happening when no real job exists.
- Place authorization logic only in React components.
- expose private mystery solutions to the client before reveal.
- Swallow exceptions, ignore failed promises, or disable validation to bypass a defect.
- add broad `any` types or unsafe casts as a shortcut around type errors.
- use `setTimeout` as a substitute for proper synchronization.
- add a library or service without a clear need.
- refactor large unrelated areas while implementing a narrow feature.
- silently change public API contracts or database semantics.
- claim tests, builds, deployments, or security checks passed without running them.
- leave placeholder controls, empty event handlers, dead links, debug output, or unfinished TODOs in a completed feature.

## 17. Expected response format from a coding agent

For a non-trivial implementation, report:

1. **Implemented:** concise summary of behavior.
2. **Files changed:** important files and why.
3. **Contracts affected:** API, data model, user flow, design, or system design changes.
4. **Validation:** exact commands run and their actual outcomes.
5. **Security and failure handling:** relevant checks performed.
6. **Limitations:** anything not implemented or not verified.
7. **Next steps:** only necessary follow-up work.

Keep the summary factual and concise. Do not provide a long self-congratulatory explanation or claim quality without evidence.

## 18. Definition of done

A change is complete when it meets the requested behavior, aligns with the project documents, has appropriate tests, handles loading and failure states, enforces server-side authorization and validation, does not leak secrets or private solution data, passes relevant repository checks, avoids unrelated changes, and includes necessary documentation. If any criterion cannot be met, state the gap clearly rather than implying completion.
