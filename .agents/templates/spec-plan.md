# NNN — <Title> Implementation Plan

**Goal:** one sentence.
**Architecture:** 2–3 sentences.
**Spec:** `specs/NNN-slug/design.md`

## Global constraints

One line each, values copied from the design.

## Review focus

Inputs/failure modes most likely to bite users, each covered by a test in the owning task.

---

### Task N: <Component>

**Files:**
- Create: `exact/path.py`
- Modify: `exact/path.py`
- Test: `exact/test_path.py`

**Interfaces:**
- Consumes: exact names/signatures from earlier tasks
- Produces: exact names/signatures later tasks rely on

- [ ] **Step 1:** Write failing test `test_name` asserting <exact values>.
- [ ] **Step 2:** Run `pytest path::test_name -v` → FAIL (<reason>).
- [ ] **Step 3:** Implement `signature` in `file`.
- [ ] **Step 4:** Run tests → PASS. Ruff clean.
- [ ] **Step 5:** Commit `type(scope): summary`.

## Rulings

Deviations decided during execution: `Task N: <finding> — <decision> — <cost if wrong>`.
