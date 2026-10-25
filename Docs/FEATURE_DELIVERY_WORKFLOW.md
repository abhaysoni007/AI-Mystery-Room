# FEATURE_DELIVERY_WORKFLOW.md — One Feature at a Time

**Status:** Mandatory development workflow  
**Applies to:** Human developers, AI coding agents, and all feature branches  
**Primary rule:** Implement and verify one feature at a time. Do not start the next feature until the current feature passes its required checks or an explicitly authorized exception is documented.

## 1. Non-negotiable rule

Work in small, independently verifiable feature slices.

For each feature, follow this sequence:

1. Understand the requirement and inspect the relevant existing code and project documentation.
2. Define the feature's acceptance criteria and identify its dependencies.
3. Implement only that feature and the minimum supporting changes required.
4. Run unit tests for the feature's logic and components.
5. Run integration tests for the boundaries the feature touches, including API, database, authentication, and external-service interactions where applicable.
6. Run relevant acceptance or end-to-end tests for user-visible behavior.
7. Run applicable linting, typechecking, and build checks.
8. Fix failures and rerun the affected tests. Repeat until the required checks pass.
9. Review the diff for security issues, regressions, unnecessary complexity, dead code, and unrelated changes.
10. Update the relevant documentation and record the actual verification results.
11. Mark the feature complete only after the completion gate in Section 4 passes.
12. Only then begin the next feature.

**Do not implement several unrelated features first and plan to test them all at the end. Do not proceed because the code “looks correct.” Do not report success when required tests have not run or have failed.**

If a test cannot run because of a real environment blocker, mark the feature **BLOCKED**, explain the reason and impact, and do not treat it as passed. Ask for a decision or resolve the blocker before moving to dependent work. An exception to the sequence requires explicit approval and must record the unverified risk; it must never be presented as a successful verification.

## 2. Before implementation

For each feature, the developer or coding agent must:

- Read the relevant parts of `SPEC.md`, `DESIGN_SPEC.md`, `USER_FLOWS.md`, `API.md`, `DATA_MODEL.md`, `ACCEPTANCE_TESTS.md`, `SYSTEM_DESIGN.md`, and `AI_DEVELOPMENT_RULES.md`.
- Inspect the existing implementation, shared components, tests, scripts, and repository conventions.
- Identify expected behavior, invalid inputs, loading/empty/error states, authorization requirements, and likely regression risks.
- Define testable acceptance criteria before coding.
- Identify any API, database, environment, security, or deployment contract that may change.
- Split a broad feature into small vertical slices if it cannot be implemented and verified safely in one unit of work.

Do not invent undocumented endpoints, fields, dependencies, or architecture. Resolve conflicts with the project documents or record the approved change.

## 3. Required test levels

Choose tests appropriate to the feature. A test level may be omitted only when it genuinely does not apply; document why. Do not omit tests merely to save time.

### 3.1 Unit testing

Verify the feature's isolated logic and edge cases.

Examples:
- Validation and normalization.
- Business rules and state transitions.
- Component behavior and conditional rendering.
- Error mapping and serialization.
- AI-output schema validation and domain invariants.

Unit tests should be deterministic, fast, and independent of live databases or AI providers unless the test specifically targets that integration.

### 3.2 Integration testing

Verify that collaborating parts work together across real boundaries.

Examples:
- API route, authentication middleware, service, and database.
- Ownership checks and public response serializers.
- Queue job creation, worker processing, persistence, and failure recovery.
- Notes/progress writes and subsequent reads.
- AI-provider adapter behavior using a controlled mock or test server.
- Error status codes and response envelopes.

Use a dedicated test database or isolated fixtures. Clean up test data reliably. Never run destructive tests against production data.

### 3.3 End-to-end / acceptance testing

For user-visible features, verify the behavior through the actual application flow using `ACCEPTANCE_TESTS.md`.

Examples:
- A user creates a mystery and sees it in the dashboard.
- A user reviews evidence, saves notes, and later sees the saved state.
- A user submits an accusation and receives the server-authoritative result.
- Another user cannot access the first user's private case.
- The hidden solution does not appear in pre-completion network responses.

Use stable test data and semantic selectors. Avoid arbitrary sleeps and tests that depend on random live AI output.

### 3.4 Static checks and build

Run the repository's existing relevant scripts for formatting, linting, typechecking, and production build. Do not invent command names; inspect `package.json` or the project's documented tooling first.

A successful build does not replace unit, integration, or end-to-end tests.

## 4. Feature completion gate

A feature may be marked **DONE** only when all applicable items below pass.

- [ ] Requirements and acceptance criteria are clear and met.
- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] Relevant end-to-end/acceptance tests pass for user-visible behavior.
- [ ] Relevant lint, typecheck, and build checks pass.
- [ ] Failure states, invalid input, and boundary cases are handled.
- [ ] Authentication, authorization, data ownership, and privacy boundaries are tested where relevant.
- [ ] No known critical regression or unresolved test failure remains.
- [ ] The code is readable, focused, and consistent with project conventions.
- [ ] No secrets, debug code, dead controls, placeholder handlers, or unrelated changes were introduced.
- [ ] Relevant project documentation is updated.
- [ ] The diff has been reviewed.
- [ ] The test report records commands run and actual results.

If an item is not applicable, state why in the feature's verification notes. If a required check fails, the feature is **IN PROGRESS**, not **DONE**. If a check is prevented by an environment or dependency blocker, the feature is **BLOCKED**, not **DONE**.

## 5. Failure and regression policy

When a test fails:

1. Stop work on the next feature.
2. Reproduce the failure and identify whether it is caused by the change, the test, or the environment.
3. Fix the implementation or correct an invalid test with a clear explanation.
4. Add a regression test for a confirmed bug where practical.
5. Rerun the failing test and the relevant surrounding test suite.
6. Rerun the required completion-gate checks.
7. Proceed only after the feature passes.

Do not delete, skip, weaken, or rewrite a valid failing test simply to obtain a green test run. Do not mask errors with hardcoded data, broad exception handling, fake success responses, or arbitrary delays.

## 6. Dependency-aware sequencing

Features may depend on earlier work. Implement and verify dependencies before building on them.

For example:

1. Shared API error and validation conventions.
2. Authentication and authorization foundations.
3. Case creation and durable generation lifecycle.
4. Case reading and investigation UI.
5. Evidence and suspect detail behavior.
6. Progress and notes persistence.
7. Accusation and authorized result reveal.
8. Secondary features and polish.

This is illustrative, not a mandate to reorder the repository blindly. Use the actual product specification and existing code to determine the sequence. Do not build a dependent feature on a knowingly failing or unverified foundation.

Parallel work is allowed only for genuinely independent features with clear ownership and contracts. Each feature must still pass its own completion gate before it is merged or used as a verified dependency.

## 7. Documentation and reporting

After each feature, provide a concise report:

- **Feature:** What was implemented.
- **Acceptance criteria:** Which criteria were satisfied.
- **Files changed:** Key files and purpose.
- **Unit tests:** Commands and actual results.
- **Integration tests:** Commands and actual results.
- **End-to-end tests:** Tests run and actual results, or a reason they do not apply.
- **Static checks/build:** Commands and actual results.
- **Security and regression review:** Relevant checks performed.
- **Documentation:** Documents updated.
- **Remaining issues:** Blockers, known limitations, or follow-up work.

Use accurate language:
- **PASS:** The test was run and passed.
- **FAIL:** The test was run and failed.
- **BLOCKED:** The test could not be run because of a stated blocker.
- **NOT RUN:** The test was not attempted.

Never claim a test passed based only on code review, expected behavior, or a successful build.

## 8. Relationship to `ACCEPTANCE_TESTS.md`

`ACCEPTANCE_TESTS.md` defines what must be verified at the product and release level. This document defines the mandatory **feature-by-feature development sequence** and completion gate.

Use both documents:
- For every feature, identify the relevant acceptance-test IDs from `ACCEPTANCE_TESTS.md`.
- Add or update acceptance tests when a new user-visible requirement is introduced.
- Do not wait until the end of the project to discover whether individual features work.
- Keep release-level testing as an additional final gate; passing one feature does not prove the entire application is ready for release.

## 9. Final rule

**One feature → unit tests → integration tests → applicable end-to-end/acceptance tests → static checks/build → review and documentation → mark complete → next feature.**

If required tests fail or have not been run, fix the problem or report the feature as blocked. Do not silently continue to the next feature.
