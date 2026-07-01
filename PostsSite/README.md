# PostsSite

A small posts/blog feed built with **plain Node.js (`node:http`) and no web
framework**, vanilla browser JavaScript (ES modules), and CSS. It's a learning
project focused on understanding how a front end, a proxy/static server, and a
data API fit together without relying on frameworks or external runtime
dependencies.

## Architecture

The app is split into two independent Node services that talk to each other
only over HTTP. Each has its own `package.json` and is run separately.

```
Browser  ──HTTP──►  Frontend (:8000)  ──HTTP──►  Server (:3000)  ──►  PostgreSQL
            UI + reverse proxy                   data API
```

### `Server/` — backend API (port 3000)

- `server.js` routes `GET /` and `POST /` to handlers in `routes/posts.js`;
  anything else is a 404. All request handling is wrapped in try/catch → 500.
  On startup it initializes the database (`db/init.js`) before listening and
  exits if the DB is unreachable.
- `data/store.js` is the persistence layer, backed by **PostgreSQL** through the
  `pg` pool in `db/pool.js`. `readPosts` runs `SELECT ... ORDER BY id`; `addPost`
  runs a parameterized `INSERT ... RETURNING`, so the `id` comes from a `SERIAL`
  column and only `title`/`author`/`content` are stored.
- `db/pool.js` reads all connection config from env vars (`DATABASE_URL`, or the
  standard `PG*` vars), with optional SSL — so the same code runs against local
  Postgres and Amazon RDS. `db/init.js` creates the `posts` table if needed and
  seeds it from `data/posts.json` once, only when the table is empty.

### `Frontend/` — UI + reverse proxy (port 8000)

- Serves the UI **and** proxies the data API from the same origin.
- `GET`/`POST /api/posts` are forwarded to the backend at `localhost:3000/`
  by `routes/proxy.js`, streaming responses straight back. A backend that's
  down returns **502**; a bad client request returns **400**.
- Every other `GET` is served from `public/` by `routes/static.js`
  (`/` → `index.html`, an extension→content-type map, a path-traversal guard,
  and 404 for missing files).

### Browser app (`Frontend/public/app/`)

Vanilla ES modules loaded via `<script type="module" src="./app/main.js">`:

- `api.js` — `getPosts()` and `createPost(post)` against `/api/posts`
  (relative, since the UI is served same-origin).
- `dom.js` — DOM logic: rendering cards (using `textContent`, never
  `innerHTML`), the create-post form, and the expand/collapse interaction.
- `main.js` — entry point that wires it all together: loads posts, renders
  them, and handles new posts from the form.

The UI and the data API share one origin (8000), so **no CORS is needed**.

## Running it

Run each service from its own directory. Start the backend first.

The backend needs a running **PostgreSQL** and a `Server/.env`. One-time setup:

```bash
cd Server
cp .env.example .env      # then fill in your credentials
createdb postssite        # create the database
```

The table is created and seeded automatically on first boot.

```bash
# Backend (port 3000) — needs PostgreSQL + Server/.env
cd Server && npm install
npm run dev      # nodemon --env-file=.env — or: npm start

# Frontend: UI + proxy (port 8000)
cd Frontend && npm install
npm run dev      # nodemon — or: npm start
```

Then open **http://localhost:8000**.

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

## Current status

Working end to end:

- ✅ Backend API: list and create posts, persisted in **PostgreSQL**.
- ✅ Reverse proxy from the Frontend to the backend.
- ✅ Static-file serving — the whole UI runs from a single origin on port 8000
  (no `npx serve`, no CORS).
- ✅ UI renders posts from the API and can create new ones via a form
  (newest on top).
- ✅ DB config is env-driven and RDS-ready (local → Amazon RDS is a `.env` change).

This is a learning project, so by design there is **no test suite, linter, or
build step** — `node` runs the source directly (ESM, `"type": "module"`). The
only runtime dependency is `pg` (plus `nodemon` for dev).

## Conventions

- ESM only (`import`/`export`, `node:`-prefixed builtins). No transpilation.
- Kept dependency-light on purpose: `pg` is the only runtime dependency, and
  config is loaded from `.env` via Node's native `--env-file` (no `dotenv`).
- Both services log every request as `[ISO timestamp] METHOD url`.
