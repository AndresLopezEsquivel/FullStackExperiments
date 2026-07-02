# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

PostsSite is a small learning project: a posts/blog feed built with **plain Node.js (`node:http`) and no web framework**, vanilla browser JS, and CSS. It is split into two independent Node services that talk to each other over HTTP.

## Architecture

Two separate npm packages, each with its own `package.json` and run independently:

- **`Server/`** — backend API, listens on **port 3000**.
  - `server.js` routes `GET /` and `POST /` to handlers in `routes/posts.js`; everything else is 404. All request handling is wrapped in try/catch → 500. On startup it `await`s `db/init.js` `initDb()` before `listen`, and `process.exit(1)`s if the database is unreachable.
  - `data/store.js` is the persistence layer, backed by **PostgreSQL** (via the `pg` `Pool` in `db/pool.js`). `readPosts()` runs `SELECT ... ORDER BY id`; `addPost()` runs a parameterized `INSERT ... RETURNING` (so `id` comes from the `SERIAL` column, and only `title`/`author`/`content` are persisted — unknown client fields are dropped). Both keep the same async signatures the routes already call.
  - `db/pool.js` builds the connection `Pool` entirely from env vars: `DATABASE_URL` if set, else the standard `PGHOST`/`PGPORT`/`PGUSER`/`PGPASSWORD`/`PGDATABASE`. SSL is enabled when `PGSSLMODE=require` (or `DB_SSL=true`) — off locally, on for Amazon RDS — so moving to RDS is a `.env` change, not a code change.
  - `db/init.js` `initDb()` runs `CREATE TABLE IF NOT EXISTS posts (...)` then seeds the table from `data/posts.json` **only when it is empty** (the seed rows carry no `id` — the `SERIAL` column assigns them in array order, keeping the sequence in sync). It is idempotent, so restarts don't re-seed. `data/posts.json` is now just seed data, not the live store.
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

Each service is run from its own directory. The backend needs a running PostgreSQL and a `Server/.env` first — copy `Server/.env.example` to `Server/.env`, fill in credentials, and create the database once (`createdb postssite`). The npm scripts load `.env` via Node's native `--env-file` (Node ≥ 20.6). On first boot the table is auto-created and seeded from `data/posts.json`.

```bash
# Backend (port 3000) — needs PostgreSQL + Server/.env
cd Server && npm install
npm run dev      # nodemon --env-file=.env, auto-reload
npm start        # node --env-file=.env server.js

# Frontend: UI + proxy (port 8000) — start the backend first
cd Frontend && npm install
npm run dev      # nodemon
npm start
```

Start both, then open **http://localhost:8000** — the Frontend serves the UI and proxies data calls to the backend, so those two processes (plus PostgreSQL) are all that's needed. There is currently **no test suite, linter, or build step** — `node` runs the source directly (`"type": "module"`, native ESM).

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
- `pg` is the only runtime dependency (Server), plus `nodemon` as a devDependency in each service. Config comes from env vars (`.env`, loaded via `--env-file` — no `dotenv`). Prefer keeping it dependency-light unless there's a clear reason.
- Both services log every request as `[ISO timestamp] METHOD url`.
