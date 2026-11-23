# Testing

## Today

- `npm run build` must pass for every code change.
- Manually verify each changed page in the browser: loading, empty, error and data states.

## Target *(planned, frontend spec 001)*

Vitest + `@nuxt/test-utils` + Vue Test Utils.

| What | How |
|---|---|
| `api/` mappers | Unit tests: DTO → view type, query params |
| Stores | Unit tests with the api module mocked at its boundary |
| Composables / formatters | Pure unit tests |
| Components with logic | Mount tests: states (loading, empty, error, data) and emitted events |

```ts
it('maps pagination from snake_case', () => {
  expect(toPagination({ page: 2, page_size: 20, total_items: 45, total_pages: 3, has_next: true, has_prev: true }))
    .toEqual({ page: 2, pageSize: 20, totalItems: 45, totalPages: 3, hasNext: true, hasPrev: true })
})
```

## Rules

- Test behavior users see, not implementation details.
- Every bug fix starts with a test reproducing it (once Vitest exists).
- Never run `npm run build` while `npm run dev` is running.
