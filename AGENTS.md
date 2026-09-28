# IntentDeck contributor notes

IntentDeck is a local-first Nifra and React app. Read [README.md](README.md) and the [open-source release checklist](docs/release-checklist.md) before changing product claims or launch copy.

## Current product

- Local preview cards support 15 formats: events, reminders, checklists, shopping lists, timers, bill splits, expenses, calculations, recipes, workouts, habits, agendas, itineraries, project plans, and notes.
- Versioned, validated local storage with JSON export and restore.
- Optional user-triggered Jev category suggestion through a typed Nifra API route.
- The TypeSafe credential is server-only. Never read it, print it, check it in, or include it in logs or screenshots.

## Local development

Requires Bun 1.4 or newer.

~~~sh
bun install
bun run dev
bun test
bun run check
bun run build:bun
bun run start
~~~

## Project conventions

- Web pages live in `routes/` and use the Nifra React adapter.
- Use `client<typeof backend>` from `@nifrajs/client` for app-to-API calls. Avoid hand-written fetch calls to this app's own API.
- Keep parsers bounded and deterministic. Never evaluate user text as code.
- Tests use mocked provider fetches. Do not make real Jev calls in tests or browser verification.
- Keep `.env` ignored and use `.env.example` for variable names only.
- Update the README, release checklist, and promotion plan when product behavior changes.
