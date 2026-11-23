# Docs and specs

## Where things go

| Content | Location |
|---|---|
| How agents/humans must work | `AGENTS.md`, `.agents/rules/` |
| What the app is (architecture, features, decisions) | `docs/` |
| Why a significant decision was made | `docs/adr/NNNN-slug.md` |
| External repos/libraries evaluated | backend `docs/integrations/README.md` (single research log) |
| A piece of work: what, why, how, steps | `specs/NNN-slug/` |
| Per-feature usage | `features/<name>/README.md` |

## Spec workflow (lightweight, superpowers-style)

```
specs/NNN-slug/
  design.md   # intent, goals/non-goals/anti-goals, constraints, approaches, decisions, open questions
  plan.md     # bite-sized tasks: exact files, interfaces, tests, commands, commits
```

1. **Design** — copy `.agents/templates/spec-design.md`. Status `draft`.
2. **Approve** — the owner approves; set `Status: approved`. No code before this.
3. **Plan** — copy `.agents/templates/spec-plan.md`. Each task: files, interfaces, failing test first.
4. **Execute** — set `in-progress`; one commit per task; record deviations as "Ruling" notes in the plan.
5. **Verify** — `npm run build`, run the page in the browser.
6. **Close** — update docs/features-catalog/changelog; set `Status: done` (or `dropped` with reason).

Numbers are **shared across both repos**: a feature touching both has `specs/NNN-slug/` in each; the
frontend design links to the backend one. Next free number: see `specs/README.md`.

## When an ADR is required

New feature boundary, new significant dependency (UI library, state, charts), routing or
auth model change. Template: `.agents/templates/adr.md`.

## Writing rules

- English. Short sections, tables and code blocks over prose.
- Mark anything not implemented as *(planned)* and link the spec that will build it.
- Docs change in the same PR as the code they describe.
- No absolute local paths (`file:///C:/...`) — use relative links.

```markdown
| mt5-connection | Token, EA setup guide, sync status | planned (spec 002) | mt5-bridge |
```
