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
  - It also sets permissive **CORS** headers on every response and short-circuits `OPTIONS` preflight with `204`. This is temporary: while the UI is served from a different origin (see below), the browser needs CORS to call the proxy.
  - `public/` holds the static UI (`index.html`, `styles/`, `app/`).

The two services communicate only via HTTP. The proxy exists so the browser eventually talks to one origin (8000) while the data API stays on a separate port (3000).

### Browser app (`public/app/`)

Vanilla ES modules, loaded via `<script type="module" src="./app/main.js">` in `index.html`:

- `api.js` — `getPosts()` and `createPost(post)`. Both `fetch` `API_BASE + /api/posts` (where `API_BASE = http://localhost:8000`, the proxy) and throw on non-2xx. `API_BASE` is absolute because the UI is currently served from a different port than the proxy; it can become `''` (relative, same origin) once static-file serving lands.
- `dom.js` — all DOM logic: `createCard` (internal) builds card markup with `textContent` (no `innerHTML`, avoids markup injection); `renderPosts` replaces the `.posts` container's children; `prependPost` adds one card on top; `initCardResize` is delegated click handling on `.posts` for expand/collapse; `initPostForm(onSubmit)` wires the create-post form.
- `main.js` — entry point: calls `initCardResize`, wires `initPostForm` to `createPost` + `prependPost`, then `getPosts` + `renderPosts`.

Posts render in stored order (oldest first); newly created posts are prepended (newest on top).

### Planned next step

- The Frontend `server.js` proxies `/api/posts` but does not yet serve the `public/` static files. The UI is currently served separately with `npx serve` (see Commands), which is why `API_BASE` is absolute and the proxy sets CORS headers. **Next step:** add a static-file route so the UI is served from port 8000 alongside the proxied API; then `API_BASE` can go relative and the CORS headers can be dropped.
- Cards use a CSS multi-column masonry layout (`public/styles/card.css`).

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

# Static UI (served separately until static-file serving is added to the proxy)
cd Frontend/public && npx serve
```

All three are needed to exercise the full UI: backend (3000), proxy (8000), and the static server (`npx serve`, on its own port). The proxy path (Frontend → Backend) needs the first two. There is currently **no test suite, linter, or build step** — `node` runs the source directly (`"type": "module"`, native ESM).

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
