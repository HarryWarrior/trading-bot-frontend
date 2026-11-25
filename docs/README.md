# Frontend documentation

Start with [`AGENTS.md`](../AGENTS.md) for the product, stack, commands and golden rules.

| Document | Content |
|---|---|
| [architecture.md](architecture.md) | Layers, feature modules, shared components, current vs target |
| [features-catalog.md](features-catalog.md) | Every feature: purpose, status, backend services, spec |
| [adr/](adr/) | Frontend decision records |
| [CHANGELOG.md](CHANGELOG.md) | Release history |
| [../specs/README.md](../specs/README.md) | Specs (numbers shared with the backend) |
| [../.agents/rules/](../.agents/rules/) | How to build |

Product-wide decisions (microservices, MT5 EA bridge, two repos) are recorded in the backend repo
`docs/adr/`.

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `NUXT_PUBLIC_API_BASE_URL` | empty | API origin; empty uses the same origin (dev proxy) |
| `NUXT_PUBLIC_API_VERSION` | `v1` | API version prefix |
| `NUXT_AUTH_URL`, `NUXT_JOURNAL_URL`, `NUXT_ANALYTICS_URL`, `NUXT_MT5_URL` | `http://localhost:8001` .. `8004` | Dev proxy targets |

Run: `npm install`, `npm run dev`; test: `npx vitest run`; check: `npm run build`, `npx nuxi typecheck`.
