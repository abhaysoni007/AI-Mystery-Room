# Evidence board delivery notes

## Scope and audit

- Investigation: added Board between Timeline and Notes; widened its workspace; added direct links from overview and evidence catalog. Kept the existing typography and paper palette.
- Board: searchable evidence/suspect/event tray, movable pins, editable theory notes, labeled connections, connection removal, keyboard positioning, explicit save status, load/save errors, and stale-write rejection.
- Mobile: material tray moves above the scrollable canvas; navigation spacing and accusation label adapt to narrow screens.
- Dashboard: renamed success rate to completion rate, allowed filters to wrap, and used API clue/suspect counts rather than fabricated defaults.
- Evidence catalog: normalized chat_log and access_log into their matching filters.
- Creation: fetches the full public dossier after receiving the creation summary. Investigation layout also recognizes an unhydrated summary.
- Landing/auth/create/verdict page structure was retained after source review; the investigation is the primary place for the board.
- No image-provider integration is included in this slice.

## Persistence

Authenticated boards use the existing user-owned progress document. Sample boards use browser storage. Saves are explicit; links and browser unload warn about unsaved edits. Concurrent tabs receive a conflict instead of overwriting an unseen board. The API validates all case references and limits payload size.

## Verification

Server suite: 55 tests passed, including persistence, stale revision, invalid reference and authentication checks.
Frontend suite: 60 tests passed across 17 files, including the updated creation pipeline integration and board pin/theory/connect/save interaction. Production build passed. git diff --check passed.
No real-browser visual or touch-device verification was performed. Pointer dragging, narrow viewport appearance, navigation warning behavior, and scrolling should receive a browser QA pass before release. No end-to-end browser runner is currently installed.
