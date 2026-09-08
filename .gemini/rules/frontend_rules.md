# Frontend Rules for Gemini / AI Assistant

- Standard Pagination: Use <AppPagination> with arrow buttons (←, →) and page size selector.
- Search Inputs: Always apply 300ms debounce before dispatching API requests.
- Button Standards: Add (btn-primary), Delete (btn-danger + trash can icon + confirmation modal), Edit (btn-secondary), Filter (btn-subtle).
- Financial Formatting: Auto-format P&L with green (+) / red (-) styling and USD formatting.
- Tooltips: Add v-tooltip or <AppTooltip> for all financial metrics.
- Skeleton Loading: Display skeleton loaders during async loading states to prevent layout flash.
- i18n & Theme: Support English/Spanish through Pinia i18n store and dark theme tokens.
- Code & Comments: 100% English code/types/docstrings. Zero trivial comments.
