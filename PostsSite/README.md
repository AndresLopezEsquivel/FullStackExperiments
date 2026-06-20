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
Browser  ──HTTP──►  Frontend (:8000)  ──HTTP──►  Server (:3000)  ──►  posts.json
            UI + reverse proxy                   data API
```

### `Server/` — backend API (port 3000)

- `server.js` routes `GET /` and `POST /` to handlers in `routes/posts.js`;
  anything else is a 404. All request handling is wrapped in try/catch → 500.
- `data/store.js` is the persistence layer. Posts live in `data/posts.json`
  (a flat JSON array) — there is no database. `addPost` assigns each new `id`
  as `last id + 1` and rewrites the whole file.

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

```bash
# Backend (port 3000)
cd Server && npm install
npm run dev      # nodemon, auto-reload — or: npm start

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

- ✅ Backend API: list and create posts, persisted to `posts.json`.
- ✅ Reverse proxy from the Frontend to the backend.
- ✅ Static-file serving — the whole UI runs from a single origin on port 8000
  (no `npx serve`, no CORS).
- ✅ UI renders posts from the API and can create new ones via a form
  (newest on top).

This is a learning project, so by design there is **no database, test suite,
linter, or build step** — `node` runs the source directly (ESM, `"type":
"module"`), and the only dependency is `nodemon` (dev only).

## Conventions

- ESM only (`import`/`export`, `node:`-prefixed builtins). No transpilation.
- No external runtime dependencies — kept dependency-light on purpose.
- Both services log every request as `[ISO timestamp] METHOD url`.
