# Suspect interviews and feature guidance - 2026-11-21

## Delivered

- Dedicated interview route under a suspect dossier; no extra workspace tab.
- Case-generation schema and both provider prompts request prepared interviews tied to that case's evidence/timeline and suspect account.
- Structural validation rejects duplicate IDs, cross-case evidence, malformed turns and forward/circular follow-ups.
- Owner-scoped GET/POST interview API with prerequisite/evidence examination gates, idempotent answers and persistent transcripts.
- Only asked answers are serialized by the interview API. Full scripts are omitted from normal public case responses.
- Pin recorded statements as cited, editable theory cards on the same case board, using revision-checked saves.
- Earlier cases or missing scripts use visibly labeled recorded testimony without invented new facts.
- Two feature announcement cards over a blurred backdrop, dismissed per account/browser/release.
- Both guides remain in User manual with New feature tags, chapter shortcuts, focus trapping and Escape support.
- User manual accessible from the navbar and investigation header.
- Evidence viewer no longer falls back to a clue from a different/sample case.

## Verification

Full suites: 64 server tests passed across 11 files; 65 frontend tests passed across 19 files.
After final deployment-path and statement-pin adjustments: 17 affected server tests and 9 affected frontend tests passed.
Production build passed after final changes. git diff --check passed.
Provider calls were mocked; no live AI generation charges were incurred.
Real-browser visual/touch QA was not performed because browser-control tools were unavailable.
Reference validation cannot prove narrative consistency or solvability; live generated cases need player/editorial evaluation.

## Deployment

Both server and client must redeploy. Existing cases do not need a migration.
Render uses rootDir server; the pure interview view helper resides inside server/src/services and is bundled by the frontend.
No new dependencies or API keys. No live model calls during questions.
Announcement dismissal is stored locally, so another device may show the release cards again.
