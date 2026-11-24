# Testing

## Setup

Vitest (`npx vitest run`, config in `vitest.config.ts`, happy-dom) + Vue Test Utils. Tests live in `tests/unit/<feature>/`.
Gates before every commit: `npx vitest run`, `npm run build`, `npx nuxi typecheck`.

| What | How |
|---|---|
| `api/` mappers | Unit tests: DTO -> view type, query params (stub `$fetch` and `useRuntimeConfig`) |
| Stores | Unit tests with the api module mocked at its boundary (`vi.mock`) |
| Composables / formatters | Pure unit tests |
| Components with logic | Mount tests: states (loading, empty, error, data) and emitted events |
| No fake data | `tests/unit/no-random-data.spec.ts` guards against `Math.random` data |

```ts
it('maps pagination from snake_case', () => {
  expect(toPagination({ page: 2, page_size: 20, total_items: 45, total_pages: 3, has_next: true, has_prev: true }))
    .toEqual({ page: 2, pageSize: 20, totalItems: 45, totalPages: 3, hasNext: true, hasPrev: true })
})
```

## Rules

- Test behavior users see, not implementation details.
- Every bug fix starts with a test reproducing it.
- Never run `npm run build` while `npm run dev` is running.
