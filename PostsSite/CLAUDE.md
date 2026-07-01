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

- **`Frontend/`** — listens on **port 8000**, serves the UI and acts as a **reverse proxy** to the backend (same origin for both).
  - `server.js` maps `GET /api/posts` and `POST /api/posts` to `routes/proxy.js` (the GET handler is exported as `getPost`, singular), which forwards to the backend at `localhost:3000/`. Backend responses are streamed straight back with `.pipe()`. Backend connection failures return **502**; bad client requests return **400**.
  - Every other `GET` falls through to `routes/static.js` (`serveStatic`), which serves files from `public/`: `/` → `index.html`, a small extension→content-type map (note `.js` → `text/javascript` so ES modules load), a path-traversal guard (→ 403), and 404 for missing files. Non-GET requests to unknown URLs are 404.
  - `public/` holds the static UI (`index.html`, `styles/`, `app/`).

The two services communicate only via HTTP. The UI and the data API share one origin (8000); the proxy forwards data calls to the backend on a separate port (3000). Because everything is same-origin, **no CORS headers are needed**.

### Browser app (`public/app/`)

Vanilla ES modules, loaded via `<script type="module" src="./app/main.js">` in `index.html`:

- `api.js` — `getPosts()` and `createPost(post)`. Both `fetch` `API_BASE + /api/posts` and throw on non-2xx. `API_BASE` is `''` (relative) because the UI is served same-origin by the proxy on port 8000.
- `dom.js` — all DOM logic: `createCard` (internal) builds card markup with `textContent` (no `innerHTML`, avoids markup injection); `renderPosts` replaces the `.posts` container's children; `prependPost` adds one card on top; `initCardResize` is delegated click handling on `.posts` for expand/collapse; `initPostForm(onSubmit)` wires the create-post form.
- `main.js` — entry point: calls `initCardResize`, wires `initPostForm` to `createPost` + `prependPost`, then `getPosts` + `renderPosts`.

Posts render in stored order (oldest first); newly created posts are prepended (newest on top).

Cards use a CSS multi-column masonry layout (`public/styles/card.css`).

## Commands

Each service is run from its own directory.

```bash
# Backend (port 3000)
cd Server && npm install
npm run dev      # nodemon, auto-reload
npm start        # node server.js

# Frontend: UI + proxy (port 8000) — start the backend first
cd Frontend && npm install
npm run dev      # nodemon
npm start
```

Start both, then open **http://localhost:8000** — the Frontend serves the UI and proxies data calls to the backend, so those two processes are all that's needed. There is currently **no test suite, linter, or build step** — `node` runs the source directly (`"type": "module"`, native ESM).

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
