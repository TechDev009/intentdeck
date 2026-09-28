# Open-source release checklist

IntentDeck is a local-first application with 25 card formats. The parser, card actions, backup flow, and supported builds are verified locally. The repository has not been published, and Jev must remain off on public multi-user deployments until access and usage controls are ready.

## Product and verification

- [x] Preview all 25 card formats locally, including colors, conversions, polls, countdowns, time zones, random, goals, contacts, links, and trips.
- [x] Use the single prompt with `/` palette, live Jev confidence, Sonner undo-delete, and AlertDialog confirms (no `window.confirm`).
- [x] Save cards in browser storage; search, kind filter, sort, paginate, complete, delete (undo), export, and restore them.
- [x] Keep the TypeSafe key server-side and make live Jev debounced with offline fallback; manual Recheck remains explicit.
- [x] Disable Jev network calls below 20 trimmed characters and reject short API requests before availability checks or provider calls.
- [x] Test the Jev adapter with mocked provider requests.
- [x] Pass `bun test` and `bun run check`.
- [x] Build and boot the Bun production target; build Node, Vercel, and Cloudflare Pages production targets.
- [x] Exercise capture, preview, save, card actions, reload persistence, backup, and restore in a browser.
- [x] Check all 25 original example sentences and the 390px mobile layout for horizontal overflow.
- [x] Make one manual Jev request on the isolated local production server using synthetic text. It returned an event suggestion; no retry was made.
- [ ] Get an independent review before enabling Jev on an internet-facing deployment.

## Repository release

- [x] Include the MIT license, third-party notices, contribution guide, and security reporting instructions.
- [x] Ignore `.env` and provide a blank `.env.example`.
- [x] Run tests, `nifra check`, and the Bun production build in CI.
- [ ] Create the initial commit, configure the GitHub remote, choose repository visibility, and set the description and topics.
- [ ] Review the exact committed files before making the repository public.
- [ ] Repeat install, checks, build, and boot from a clean clone.

Suggested GitHub description: **A local-first Nifra app that turns short thoughts into useful cards.**

Suggested topics: `nifra`, `typescript`, `bun`, `react`, `local-first`, `open-source`.

## Jev deployment boundary

Jev's current limits are in memory: five requests per minute and 50 per day per server process. They do not coordinate across instances or replace authentication. Keep `INTENTDECK_JEV_ENABLED=false` on public multi-user deployments until authentication and durable usage limits are in place. Never put `TYPESAFE_API_KEY` in client-side variables, screenshots, CI logs, or promotion assets.

## Screenshots and promotion

- [x] Replace reference-style sample text with original IntentDeck examples in the UI, tests, and README.
- [x] Capture a local UI review screenshot at `output/playwright/intentdeck-live-preview.png` using synthetic content and no Jev call.
- [x] Write the factual Gemini and Antigravity brief in the [promotion plan](promotion/x-launch-plan.md).
- [ ] Draft the final post copy and short product demo using the current release build.
- [ ] Check every claim against the release build and replace `{{REPO_URL}}` only after the public repository exists.
- [ ] Publish only the exact content the owner has reviewed.
