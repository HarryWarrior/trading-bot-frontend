# Git workflow

Same policy in `Trading-bot-backend` and `trading-bot-frontend`.

## Branches

| Branch | Purpose |
|---|---|
| `main` | Released code only. Never commit directly. |
| `dev` | Integration branch. Never commit directly; merge via PR. |
| `feat/<slug>` `fix/<slug>` `docs/<slug>` `chore/<slug>` `refactor/<slug>` | Work branches, created from `dev` |

Prefer one branch per spec (or per plan task group), e.g. `feat/002-mt5-ea-bridge`.

## Commits — Conventional Commits

```
<type>(<scope>): <imperative summary in English>

<optional body: why, not what>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`. Scope = service or area
(`journal`, `mt5-bridge`, `shared`, `agents`, `specs`).

```bash
git commit -m "feat(mt5-bridge): add idempotent deal ingestion endpoint"
```

Small commits, each leaving tests green. Never commit `.env`, credentials, `data/raw/` personal
reports with real account data, `.venv/` or `node_modules/`.

## Pull requests

- Target `dev`. Title in Conventional Commit form. Body: link the spec, summary, how it was tested.
- Required before merge: tests/build green, linters clean, docs/catalog/changelog updated.
- Release: PR `dev → main`, tag `vX.Y.Z`.

## Hooks and changelog

```bash
git config core.hooksPath .githooks         # once per clone (backend repo)
python scripts/update_changelog.py          # backend only; frontend: edit docs/CHANGELOG.md by hand
```

Backend only: `.githooks/pre-push` runs Ruff and verifies the changelog. Frontend: run `npm run build` before pushing.

## Agents

- Never push, force-push, merge into `dev`/`main`, delete branches or rewrite shared history
  without explicit approval from the owner in the conversation.
- Agents may create local branches and commits for the task they were given.
