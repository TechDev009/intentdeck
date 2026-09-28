# IntentDeck

**A thought in. A useful card out.**

IntentDeck turns a short thought into one of 25 practical card formats. A bounded local parser updates the preview as you type. Review the details, then add the card to your browser-based deck.

IntentDeck builds focused cards; it does not generate arbitrary app screens. Typing and previewing stay on your device. Jev is optional and runs only when the thought has at least 20 characters.

## 25 card formats

- **Events and reminders** recognize today, tomorrow, weekdays, ISO dates, and explicit times. Unclear times are flagged instead of guessed.
- **Checklists** turn comma- or semicolon-separated steps into individually checkable items.
- **Shopping lists, workouts, meeting agendas, itineraries, and project plans** keep their own checkable items and progress.
- **Expenses** keep the amount, currency, category, and spend date together. Common categories are suggested locally from the description.
- **Recipes** separate ingredients from ordered steps so prep and cooking can be checked off independently.
- **Habits** can repeat daily or weekly; completion rolls over with the local day or week.
- **Timers** support durations from one second to 24 hours, with start, pause, resume, and reset controls. The countdown appears in the open app; it does not send operating-system notifications.
- **Bill splits** divide a supported currency amount into cent-accurate shares.
- **Calculations** handle arithmetic, parentheses, and percentages with a bounded parser. User text is never evaluated as JavaScript.
- **Notes** keep thoughts that do not match another supported format.
- **Colors** show a swatch from a hex code or common name, with one-tap copy.
- **Conversions** compute length, mass, volume, and temperature between matching units.
- **Polls** turn options into votable cards with live tallies.
- **Countdowns** count days to a holiday, weekday, or ISO date.
- **Time zones** convert a clock time between zones at standard offsets.
- **Random** rolls dice, flips coins, or picks from options, with re-roll.
- **Goals** track current against target with progress and +1 steps.
- **Contacts** keep a name with phone and email, with one-tap copy.
- **Links** save a URL with an optional note and one-tap open.
- **Trips** keep a destination with its transport mode.
- **Your deck** supports search, open/done filters, deletion, and validated JSON backup and restore. Cards live in this browser and do not sync between devices.

## Try it

Type a thought in the single prompt and watch the matching card take shape below. Press `/` or `Cmd/Ctrl+K` for the card palette with all 25 kinds and live Jev confidence. `Enter` saves to your browser deck (with Undo on delete), `Esc` clears, `Tab` keeps a faint preview.

- `Accessibility review on 2026-10-16 at 14:30 with video link` → Event card with Video badge and mini-month calendar
- `buy milk, eggs, bread and coffee` → Shopping checklist with real checkboxes and progress
- `Split ₹1,275.50 among 4` → per-person share table
- `Recipe: tomato lentils; ingredients: lentils, tomatoes, ginger; steps: simmer lentils, temper spices, fold together` → Ingredients/Method tabs
- `Habit: take a 20-minute walk daily` → daily/weekly toggle with streak view
- `Spent ₹430 on taxi today` → expense with category badge; the deck aggregates spend by category

Your deck includes an insights panel (completion donut, kind mix, 14-day activity) plus search, kind and status filters, sorting, pagination, and pinning.

The header moon/sun button switches a full dark theme (persisted, respects system preference). The UI is built from vendored shadcn-style primitives (Radix behavior + `components/ui` APIs) on IntentDeck design tokens. Bun is the supported runtime (`bun run dev`, `bun test`, `bun run check`, `bun run build:bun`).

- `Accessibility review on 2026-10-16 at 14:30`
- `Remind me to return the equipment badge on 2026-10-02 at 16:15`
- `Create a checklist: confirm the deploy window, export the error report, notify support`
- `Set timer for 8 minutes to steep green tea`
- `Split ₹1,275.50 among 4`
- `Calculate (2450 * 0.18) + 2450`
- `Record printer model PX-410 uses 63A toner cartridges`
- `Shopping: oat milk, black beans, limes`
- `Spent ₹430 on taxi today`
- `Recipe: tomato lentils; ingredients: lentils, tomatoes, ginger; steps: simmer lentils, temper spices, fold together`
- `Workout: Upper body; rows 3x10, push-ups 3x8, stretch 5 minutes`
- `Habit: take a 20-minute walk daily`
- `Agenda: Launch review; support readiness, rollback plan, documentation owner`
- `Itinerary: Kyoto day one; 09:00 Fushimi Inari, 12:30 lunch at Nishiki Market, 15:00 check in`
- `Project plan: IntentDeck release; finish onboarding docs, record walkthrough, tag v1`

The local parser intentionally supports a limited set of formats. When it cannot safely identify a structured card, it keeps the text as a note for you to review.

## Privacy and Jev

The local card flow needs no account, API key, or network request containing your thought. Cards are saved in this browser's local storage. Export a JSON backup to move them to another browser, or clear the deck from the page.

Jev assist is optional. When enabled, typing a thought with at least 20 characters after trimming outer whitespace sends it to TypeSafe for a live intent classification (one call answers intent plus variant signals); shorter thoughts use the local preview and an offline heuristic with no network call. Jev decides the card shape and variant badges only; the local parser remains responsible for dates, amounts, calculations, durations, and card details. A request may use your Jev allocation. Saving a card does not call Jev.

For local Jev use, copy `.env.example` to `.env`, add your key to `TYPESAFE_API_KEY`, and set `INTENTDECK_JEV_ENABLED=true`:

```dotenv
TYPESAFE_API_KEY=
JEV_MODEL=jev-1.13.0
INTENTDECK_JEV_ENABLED=true
```

Keep `.env` private. The key is read by the server and is not included in browser code. Production deployments should use a server-side secret manager. The current rate limits are in memory and apply per server process; they do not coordinate across instances. Keep Jev disabled on public multi-user deployments until authentication and durable usage controls are in place.

## Run locally

Requires Bun 1.4 or newer.

```sh
bun install
bun run dev
```

Open the local URL printed by the command, usually `http://localhost:4321`.

To use Jev locally, create `.env` as described above and restart the server. You can use the app without configuring Jev.

## Verify and build

```sh
bun test
bun run check
bun run build:bun
bun run build:node
bun run build:vercel
```

`bun run start` serves the built Bun application. Local Bun, Node, and Vercel production builds have been verified. The CI workflow runs the automated checks and Bun build.

## Deploy

The app needs its server routes (`/api/intent`, `/api/jev/*`) for Jev classification, so it must be hosted where code runs — **GitHub Pages cannot host it** (static files only; the API would be dead and only offline mode would work).

Supported targets, all verified:

```sh
bun run build          # Cloudflare Pages → dist/ (recommended)
bun run build:vercel   # Vercel → .vercel/output
bun run build:bun      # Bun server → dist-bun/
bun run build:node     # Node server → dist-node/
```

Cloudflare Pages (recommended):

```sh
bun run build
bunx wrangler pages deploy dist
bunx wrangler pages secret put TYPESAFE_API_KEY
bunx wrangler pages secret put JEV_MODEL        # optional, defaults to jev-1.13.0
```

Then set `INTENTDECK_JEV_ENABLED=true` in the Pages project environment. Without the key (or with the flag off) the app runs fully offline — every card, the palette, the deck, and charts work; only the HUD reads "Offline". Keep Jev disabled on public multi-user deployments until authentication and durable usage controls are in place; the built-in limits are in-memory per process (5/min, 50/day).

## Project map

- `routes/index.tsx` contains the single-box shell, live preview, palette, deck, and card controls.
- `components/ui/` contains the vendored shadcn-style primitives (Radix behavior on IntentDeck tokens, no Tailwind pipeline).
- `lib/cards.ts` contains the bounded parser, card types, timer helpers, and card validation.
- `lib/storage.ts` validates local storage and portable backups.
- `backend.ts` defines the typed Jev status, live intent, and suggestion routes.
- `lib/jev.ts` defines the TypeSafe fan-out decision (intent plus variant signals).

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and the [open-source release checklist](docs/release-checklist.md). Draft launch materials are in the [X/Twitter promotion plan](docs/promotion/x-launch-plan.md).

IntentDeck is an independent project built with Nifra and Nifra Decision. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for notices.

## License

MIT. See [LICENSE](LICENSE).
