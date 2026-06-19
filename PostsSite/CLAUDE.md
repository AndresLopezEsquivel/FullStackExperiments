# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

PostsSite is a small learning project: a posts/blog feed built with **plain Node.js (`node:http`) and no web framework**, vanilla browser JS, and CSS. It is split into two independent Node services that talk to each other over HTTP.

## Architecture

Two separate npm packages, each with its own `package.json` and run independently:

- **`Server/`** — backend API, listens on **port 3000**.
  - `server.js` routes `GET /` and `POST /` to handlers in `routes/posts.js`; everything else is 404. All request handling is wrapped in try/catch → 500.
  - `data/store.js` is the persistence layer. Posts are stored in `data/posts.json` (a flat JSON array); there is no database. `addPost` assigns a new `id` as `last id + 1` and rewrites the whole file. `getDataPath()` resolves the JSON path relative to `store.js` via `import.meta.url`.
  - `sendResponse(res, data, statusCode, contentType)` is the shared response helper used everywhere.

- **`Frontend/`** — listens on **port 8000**, acts as a **reverse proxy** to the backend.
  - `server.js` maps `GET /api/posts` and `POST /api/posts` to `routes/proxy.js`, which forwards to the backend at `localhost:3000/`. Backend responses are streamed straight back with `.pipe()`. Backend connection failures return **502**; bad client requests return **400**.
  - `public/` holds the static UI (`index.html`, `styles/`, `app/`).

The two services communicate only via HTTP. The proxy exists so the browser talks to one origin (8000) while the data API stays on a separate port (3000).

### Current state / planned next steps

- The browser UI is **not yet wired to the API** — this is intentional, mid-build. `public/index.html` hard-codes ~12 sample cards and loads `./app/main.js`, which is currently an empty placeholder. The only live JS is the card expand/collapse logic in `public/app/dom.js` (event delegation on `.posts`, toggling the `expanded` class and the "Show more"/"Show Less" button text). **Next step:** `main.js` is the intended entry point that will fetch from the proxy (`/api/posts`) and render cards; `dom.js` (not yet referenced by `index.html`) holds the interaction logic to compose in.
- The Frontend `server.js` proxies `/api/posts` but does not yet serve the `public/` static files. **Next step:** add a static-file route so the UI is served from port 8000 alongside the proxied API.
- Cards use a CSS multi-column masonry layout (see recent commits and `public/styles/`).

## Commands

Each service is run from its own directory.

```bash
# Backend (port 3000)
cd Server && npm install
npm run dev      # nodemon, auto-reload
npm start        # node server.js

# Frontend proxy (port 8000) — start the backend first
cd Frontend && npm install
npm run dev      # nodemon
npm start
```

Both must be running for the proxy path to work (Frontend → Backend). There is currently **no test suite, linter, or build step** — `node` runs the source directly (`"type": "module"`, native ESM).

### Manual API checks

```bash
# Backend directly
curl localhost:3000/
curl -X POST localhost:3000/ -H 'Content-Type: application/json' \
  -d '{"title":"T","author":"A","content":"..."}'

# Through the Frontend proxy
curl localhost:8000/api/posts
curl -X POST localhost:8000/api/posts -H 'Content-Type: application/json' \
  -d '{"title":"T","author":"A","content":"..."}'
```

## Conventions

- ESM only (`import`/`export`, `node:` prefixed builtins). No transpilation.
- No external runtime dependencies — only `nodemon` as a devDependency. Prefer keeping it dependency-light unless there's a clear reason.
- Both services log every request as `[ISO timestamp] METHOD url`.
