# IntentDeck

[![CI](https://github.com/TechDev009/intentdeck/actions/workflows/ci.yml/badge.svg)](https://github.com/TechDev009/intentdeck/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

One text box that becomes the right card as you type. IntentDeck classifies a
thought into one of 25 interactive card formats, computes every value with
bounded deterministic parsers, and saves the result to a browser-local deck.
No account, no tracking, no build-time AI calls.

```sh
bun install
bun run dev
```

Type `buy milk, eggs, bread and coffee` — a shopping checklist takes shape
below the input before you finish the sentence. `Enter` saves it.

## How it works

**Jev decides, code computes.** One TypeSafe call answers 11 questions in
parallel against the same text — the card kind plus variant signals (urgency,
tone, event mode, timer kind, expense category, listiness, recurrence).
Jev is never asked for dates, amounts, durations, or list items; those come
from deterministic parsers with hard bounds, so the model cannot hallucinate
a value onto your card.

```
keystroke → 280ms debounce → POST /api/intent → IntentResult
  → hysteresis state machine (input/ghost/choose/committed)
  → Jev-wins draft (shape from Jev, values from parsers)
  → kind-specific renderer → Enter materializes a validated card
```

Raw model output flickers while you type, so a committed card only swaps
when a challenger wins twice in a row (or arrives at ≥0.85), and signal
badges ride on/off hysteresis bands. Short thoughts (<20 chars) never touch
the network — an offline keyword classifier returns the same `IntentResult`
shape, so the whole pipeline below it is transport-blind.

## Card formats

| Group | Kinds |
|---|---|
| Time | event, reminder, timer, countdown, habit |
| Lists | checklist, shopping, workout, agenda, itinerary, project, poll |
| Money & math | split, expense, calculation, convert |
| Knowledge | recipe, note, color, link, contact |
| Fun & travel | random, goal, timezone, travel |

Notes are the universal fallback: any non-empty text resolves to *something*
committable, titled with your own words. User text is never evaluated as
JavaScript; timers run 1s–24h with no OS notifications; splits are
cent-exact; contacts never mistake an ISO date for a phone number.

## Interface

- **Single morphing shell** — input, live card, and `Add ↵` share one
  container that expands with the content. `Enter` saves, `Esc` clears,
  `Tab` keeps a faint preview.
- **Command palette** (`/` or `Cmd/Ctrl+K`) — all 25 kinds with live Jev
  confidence per item.
- **Deck** — search, status/kind filters, sorting, pagination, pinning,
  per-card actions with undo-delete, validated JSON backup/restore, and an
  insights panel (completion donut, kind mix, 14-day activity, spend chart).
- **Full dark theme** — persisted toggle, system-preference default.

## API

Typed end to end via `client<typeof backend>` from `@nifrajs/client` — no
hand-written fetches. The key never leaves the server.

| Route | Purpose | Guards |
|---|---|---|
| `GET /api/jev/status` | Whether Jev assist is configured | — |
| `POST /api/intent` | Full fan-out classification | ≥20 chars, 5/min + 50/day per process, 60s server cache |
| `POST /api/jev/suggest` | Single-kind suggestion (compat) | Same as above |

```sh
cp .env.example .env
```

```dotenv
TYPESAFE_API_KEY=
JEV_MODEL=jev-1.13.0
INTENTDECK_JEV_ENABLED=true
```

Without a key (or with the flag off) everything works offline — the HUD
simply reads `Offline`. Keep Jev disabled on public multi-user deployments
until authentication and durable usage controls exist; the built-in limits
are in-memory per process and do not coordinate across serverless instances.

## Verify

```sh
bun test        # 79 tests, mocked provider fetches only — no real Jev calls
bun run check   # nifra typecheck + contract/lint gates
bun run build:bun
bun run build:node
bun run build:vercel
bun run build   # Cloudflare Pages
```

`bun run start` serves the Bun build. CI runs tests, `check`, and the Bun
and Node builds on every push to `main`.

## Deploy

Server routes are required for Jev, so host where code runs — GitHub Pages
(static files only) would leave the API dead.

```sh
bun run build                              # Cloudflare Pages → dist/ (recommended)
bun run build:vercel                       # Vercel → .vercel/output
bun run build:bun                          # Bun server → dist-bun/
bun run build:node                         # Node server → dist-node/
```

Cloudflare Pages:

```sh
bun run build
bunx wrangler pages deploy dist
bunx wrangler pages secret put TYPESAFE_API_KEY
```

Then set `INTENTDECK_JEV_ENABLED=true` in the Pages project environment.

## Project map

- `routes/index.tsx` — shell, live preview, palette, deck, card controls
- `components/ui/` — vendored shadcn-style primitives (Radix behavior on
  IntentDeck tokens, no Tailwind pipeline) + theme toggle
- `lib/cards.ts` — bounded parsers, card types, validation, migration
- `lib/jev.ts` — TypeSafe fan-out decision (intent + variant signals)
- `lib/intent-state.ts`, `lib/signal-gate.ts` — calm-UI state machine
- `lib/jev-draft.ts` — Jev-wins draft resolution without invented values
- `lib/intent-local.ts` — offline classifier, same result shape
- `lib/storage.ts` — validated local storage, backups, forward migration
- `backend.ts` — typed Jev status, intent, and suggestion routes

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and the
[open-source release checklist](docs/release-checklist.md). Draft launch
materials are in the [X/Twitter promotion plan](docs/promotion/x-launch-plan.md).

## For AI agents

Start with [AGENTS.md](AGENTS.md) — conventions, Jev key handling, and the
docs to update when product behavior changes. Run `bun run check` as the
done-gate.

## License

MIT. See [LICENSE](LICENSE). Third-party notices in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
