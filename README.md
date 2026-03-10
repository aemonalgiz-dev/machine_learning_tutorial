# oop_ml teaching website

An interactive tour of machine learning. Every concept is taught the same way:

1. **The problem that forced it** — the itch someone had that made the idea
   necessary, not a timeline of dates.
2. **In plain terms** and **the mechanism** — one explanation for anyone, one
   for the technical reader, side by side.
3. **Something you can poke** — a small interactive playground both explanations
   narrate, computed **live by the [`oop_ml`](../) library** through its
   [API](../api), so what you see is the real algorithm rather than a
   re-implementation in JavaScript.

## Why it is a separate repository

Three components, three repositories, each deploying on its own cadence: the
library, the API that exposes it over HTTP, and this site, which calls the API
and never imports the library. The site is nested inside the library's project
folder for convenience but keeps its own git history and remote — the parent
repo ignores it.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind. Playgrounds are
hand-written SVG driven by pointer events, fetching fits from the API.

## Running

The site needs the API running alongside it:

```bash
# in ../api
.venv/Scripts/uvicorn oop_ml_api.main:app --reload   # http://localhost:8000

# here
npm install
npm run dev                                           # http://localhost:3000
```

Set `NEXT_PUBLIC_API_BASE_URL` (see `.env.example`) to point at a deployed API.

## Adding a concept

A concept is a page under `app/concepts/<slug>/` that fills the reusable
`ConceptPage` shell (`components/concept/`) with its four parts and a playground
widget (`components/widgets/`), plus one endpoint in the API. The shell enforces
the teaching structure so every concept reads the same way.
