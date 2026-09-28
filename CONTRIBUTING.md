# Contributing

Thanks for your interest in IntentDeck. Read the [README](README.md), [contributor notes](AGENTS.md), and [release checklist](docs/release-checklist.md) before proposing product or launch changes.

## Set up locally

Requires Bun 1.4 or newer.

~~~sh
bun install
bun run dev
~~~

The default local path works without a key. Jev assist is optional and uses a server-side TypeSafe key only after a user clicks the Jev button. Do not make live Jev calls in tests or routine development checks.

## Before opening a pull request

- Keep changes focused and explain user-visible behavior.
- Add or update parser, storage, and mocked provider tests when behavior changes.
- Update the README, release checklist, and promotion plan if product claims or behavior change.
- Include a screenshot or short recording for user interface changes.
- Do not commit `.env`, API keys, personal data, local browser data, or generated build output.
- Keep client-to-server calls on `client<typeof backend>` from `@nifrajs/client`.

## Useful commands

~~~sh
bun test
bun run check
bun run build:bun
bun run start
~~~

Please report security issues privately using the process in [SECURITY.md](SECURITY.md).
