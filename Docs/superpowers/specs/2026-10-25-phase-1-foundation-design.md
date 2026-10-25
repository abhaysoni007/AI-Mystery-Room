# Phase 1 Foundation Design Specification

**Document:** `docs/superpowers/specs/2026-10-25-phase-1-foundation-design.md`  
**Status:** Approved  
**Related Specs:** `Docs/specs.md`, `Docs/DESIGN_SPEC.md`, `Docs/API.md`, `Docs/DATA_MODEL.md`, `Docs/FEATURE_DELIVERY_WORKFLOW.md`

---

## 1. Objective
Establish the production-grade monorepo foundation for **AI Mystery Room**, adhering strictly to all engineering principles in `AI_DEVELOPMENT_RULES.md` and `FEATURE_DELIVERY_WORKFLOW.md`.

## 2. Monorepo Architecture & File Map

```text
ai-mystery-room/
├── package.json              # Root npm workspaces ["client", "server"]
├── .gitignore                # Complete Node, Vite, env, media ignore
├── .env.example              # Server and client environment templates
├── client/
│   ├── index.html            # Space Grotesk, Inter, IBM Plex Mono imports
│   ├── package.json          # React 19, Vite, Tailwind CSS, Lucide React, Vitest
│   ├── vite.config.js        # API proxy to localhost:5000, port 5173
│   ├── tailwind.config.js    # Neo-brutalist theme extensions
│   ├── postcss.config.js
│   └── src/
│       ├── styles/
│       │   ├── tokens.css    # CSS variables for ink, paper, yellow, pink, blue, etc.
│       │   └── index.css     # Tailwind directives and base utility styles
│       ├── components/
│       │   ├── ui/
│       │   │   ├── Button.jsx # Neo-brutalist buttons (primary, secondary, danger, ghost)
│       │   │   └── Card.jsx   # Neo-brutalist bordered cards with hard offset shadows
│       │   └── layout/
│       │       ├── Navbar.jsx # Header with wordmark, navigation links, and theme styling
│       │       └── Footer.jsx # Footer with product credits and links
│       ├── App.jsx           # Public shell showing foundation status & UI component preview
│       ├── main.jsx
│       └── tests/
│           ├── setup.js
│           └── App.test.jsx
├── server/
│   ├── package.json          # Express, Mongoose, Zod, Helmet, Cors, Morgan, Vitest, Supertest, mongodb-memory-server
│   └── src/
│       ├── config/
│       │   ├── env.js        # Validated env vars with Zod schema
│       │   └── db.js         # Mongoose connection with graceful shutdown & mock support
│       ├── middleware/
│       │   ├── errorHandler.js # Standard error envelope transformer
│       │   └── requestLogger.js
│       ├── utils/
│       │   └── response.js   # Standard success/error response helpers
│       ├── routes/
│       │   ├── index.js      # Base router mounting /api/v1
│       │   └── health.js     # GET /api/v1/health
│       ├── app.js            # Express app assembly
│       ├── server.js         # HTTP listener
│       └── tests/
│           ├── setup.js      # In-memory Mongo lifecycle for integration tests
│           └── health.test.js
└── Docs/                     # Authoritative Single Source of Truth
```

## 3. Interfaces & Contracts

### 3.1 Standard Response Envelopes (`server/src/utils/response.js`)
- `sendSuccess(res, { data, message, meta, statusCode = 200 })`:
  ```json
  {
    "success": true,
    "data": {},
    "message": "Request completed successfully",
    "meta": {}
  }
  ```
- `sendError(res, { code, message, statusCode = 500, fields = null, requestId = null })`:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Safe display message",
      "fields": {},
      "requestId": "req_123"
    }
  }
  ```

### 3.2 Design System Tokens (`client/src/styles/tokens.css`)
- Colors:
  - `--color-ink`: `#191919`
  - `--color-paper`: `#FFF9EE`
  - `--color-white`: `#FFFFFF`
  - `--color-muted`: `#68645F`
  - `--color-yellow`: `#FFE45E`
  - `--color-pink`: `#FF78B7`
  - `--color-coral`: `#FF6B57`
  - `--color-blue`: `#75C9FF`
  - `--color-green`: `#8DE0A1`
  - `--color-purple`: `#B5A0FF`
  - `--color-orange`: `#FFB454`
- Borders & Shadows:
  - `--border-width`: `2px`
  - `--border-width-strong`: `3px`
  - `--radius-md`: `12px`
  - `--shadow-hard-md`: `5px 5px 0 var(--color-ink)`
  - `--shadow-hard-hover`: `2px 2px 0 var(--color-ink)`
- Typography:
  - Display: `Space Grotesk, sans-serif`
  - Body: `Inter, sans-serif`
  - Mono: `IBM Plex Mono, monospace`

## 4. Verification Requirements
1. `npm test` runs all backend unit/integration tests and frontend component tests and passes.
2. `GET /api/v1/health` returns status code 200 and matches the API envelope contract.
3. `npm run build` cleanly builds the Vite client distribution and verifies server entry point.
4. Git commit records the Phase 1 milestone.
