# 004 — AI journal UI (frontend design)

- **Status:** draft
- **Date:** 2026-11-23
- **Backend (source of truth):** `Trading-bot-backend/specs/004-ai-journal/design.md`

## Intent

Show the journal the AI writes next to the user's executions, and let the user control the AI's access.

## Goals

- Feature `ai-journal`: journal entries per trade/day (notes, tags, rating, screenshots/links), with an
  "AI" badge and source on AI-written content; user can edit/accept/reject.
- API/MCP tokens page: create (shown once), scopes (`journal:read`, `journal:write`), revoke, last used.
- Connection guide for MCP clients (config snippet to copy).

## Non-goals

In-app chat with an LLM.

## Done when

After an AI client annotates trades via MCP, the user sees the entries marked as AI and can edit them.
