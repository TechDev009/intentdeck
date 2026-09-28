# X/Twitter launch materials plan for Gemini and Antigravity

## Live-preview proof point

The main flow turns one sentence into a live card preview while the user types. The bounded local parser recognizes 25 card kinds: events, reminders, checklists, shopping lists, timers, bill splits, expenses, calculations, recipes, workouts, habits, agendas, itineraries, project plans, notes, colors, conversions, polls, countdowns, time zones, random, goals, contacts, links, and trips. Short thoughts preview locally with an offline heuristic and make no model request; thoughts with at least 20 trimmed characters use live Jev intent when enabled. Promotion can show both the format breadth and real card actions such as voting in polls, re-rolling dice, or tracking goals.

This file assigns draft work to Gemini and Google Antigravity. It does not authorize posting, scheduling, tagging accounts, or contacting anyone. Keep all work in this repository until the owner reviews it.

## Goal and audience

Introduce IntentDeck as a new open-source Nifra app, then show the working local card flow. The first audience is developers interested in Nifra, Bun, TypeScript, and small local-first tools. A second audience is people who want a quick capture surface for practical everyday tasks.

## Claims the materials may make

Use only original IntentDeck scenarios from `CARD_EXAMPLES` in the interface and launch assets. Do not copy example messages from ShapeShift or any other reference app. Keep each product claim tied to the current source.

- IntentDeck is built with Nifra and React.
- The local path previews and saves all 25 supported formats: events, reminders, checklists, shopping lists, timers, bill splits, expenses, calculations, recipes, workouts, habits, agendas, itineraries, project plans, notes, colors, conversions, polls, countdowns, time zones, random, goals, contacts, links, and trips.
- Cards stay in browser local storage and can be exported or restored as JSON.
- Jev assist is optional and live: thoughts with at least 20 trimmed characters are classified into intent plus variant signals when enabled. It may use the user's Jev allocation.
- The supported release target verified in this work is Bun.

Do not claim a hosted demo, public GitHub URL, multi-device sync, production traffic, user testimonials, speed gains, automatic task execution, a broad natural-language parser, or a live Jev result. Do not show or transmit `.env`, an API key, personal data, browser tabs, or a real user's deck. Never make a Jev request as part of asset creation; the available test budget is limited and the local path is enough for the demo.

## Campaign sequence

1. **Repository introduction:** after the owner makes the repository public, post a short thread with the repository link and one real app screenshot. Say that the app runs locally and name the supported Bun path.
2. **Product demo:** after the release build has been rechecked, post a 20-30 second recording of capture, preview, add, and a useful card action. Link to the repository, not an unverified demo URL.
3. **Builder follow-up:** share one technical post about Nifra's typed server boundary, the deterministic local parser, or the optional Jev adapter. Use a code excerpt that matches the current implementation.

Leave `{{REPO_URL}}` and `{{DEMO_URL}}` placeholders until those destinations exist and the owner chooses to use them. Skip `{{DEMO_URL}}` if no hosted demo is approved.

## Draft package

Gemini prepares:

- `docs/promotion/drafts/x-thread.md`: 5-7 posts, each under 280 characters including link placeholders. Include a short opening, the concrete local workflow, the Nifra connection, and a clear call to action.
- `docs/promotion/drafts/visual-copy.md`: title, captions, thumbnail words, and accessible alt text for the screenshot and demo.
- `docs/promotion/drafts/fact-check.md`: each product or technical claim, its code or documentation source, and any wording that needs owner review.

Antigravity prepares:

- `docs/promotion/drafts/demo-shotlist.md`: a 20-30 second shot list using synthetic example text only.
- `docs/promotion/drafts/asset-spec.md`: a 1200x675 landscape image, a 1:1 crop, a 16:9 screen recording, on-image copy, and alt text.
- Final media files only after the owner approves the shot list. Keep them in the local `docs/promotion/drafts/assets/` folder until reviewed.

## Gemini brief

Read this plan, the current README, the release checklist, and the current route. Draft the three Gemini files listed above. Use only the approved claims in this plan. Count every post with link placeholders included. Write in a direct builder voice; avoid launch hype, invented results, unsupported performance claims, and references that imply affiliation with another project. Do not change product code or publish anything.

## Antigravity brief

Use the checked release build in a clean browser profile. Make a silent 20-30 second recording: start at the single prompt, type an original IntentDeck recipe thought, show the live ingredients and method preview, save it, and check one ingredient and one step. Briefly show an original split or expense preview. The 15 formats are detected from text; do not imply there is a format picker. Keep the browser on IntentDeck. Do not invoke Jev, inspect `.env`, expose a key, upload assets, or publish.

## Owner review before any post

- Confirm the repository URL and visibility.
- Re-run `bun test`, `bun run check`, and every documented build target on the exact source used for the capture.
- Compare the screenshot and every sentence with that build.
- Confirm the file contains no keys, user data, browser chrome, misleading Jev result, or unapproved destination.
- Review the exact final post text and media before publishing.
