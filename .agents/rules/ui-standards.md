# UI standards

Modern SaaS look (zinc neutral palette, 1px subtle borders, soft shadows, dark theme first).
Always reuse `components/Common/App*` — catalog: `docs/architecture.md`.

## Buttons (`AppButton`)

| Action | Variant | Lucide icon | Behavior |
|---|---|---|---|
| Add / create | `primary` | `Plus` / `Upload` | Opens create modal or upload |
| Delete | `danger` | `Trash2` | **Always** `AppConfirmDeleteModal` first |
| Edit | `secondary` | `Pencil` | Inline or modal edit |
| Filter / search | `subtle` | `Search` / `SlidersHorizontal` | Toggles filters |
| Loading | `loading` prop | spinner | Disables the button |

## Lists and data

- Collections use `AppPagination` (← →, "Page X of Y", sizes 20/50/100) backed by the backend
  pagination contract.
- Search inputs debounce **300 ms** before calling the API.
- Async states: `AppSkeleton` while loading (no layout flash), `AppEmptyState` when empty (with CTA),
  visible error message with retry on failure.

```vue
<AppSkeleton v-if="loading" height="h-10" />
<AppEmptyState v-else-if="!items.length" :title="t('trades.empty')" :description="t('trades.emptyHint')" />
```

## Financial display

- P&L: green with `+` for profit, red with `−` for loss, USD formatted, 2 decimals.
- Trend icons: `TrendingUp`/`ArrowUpRight` (positive), `TrendingDown`/`ArrowDownRight` (negative).
- Trade status badges: WINNER emerald, LOSER rose, BREAK_EVEN slate.
- Every financial metric has an `AppTooltip` with its definition (e.g. "Profit factor = gross profit / gross loss").

## Forms

- `AppInput` with label, hint and error; password fields always have the eye toggle.
- File upload: drag & drop zone, `.csv`/`.xlsx` only, ≤ 10 MB, validated before sending.

## Icons, theme, i18n, layout

- Icons only from Lucide (`lucide-vue-next`).
- Dark theme via `useTheme`; colors from Tailwind tokens, no hard-coded hex in components.
- All visible text through `useI18n` (en/es).
- Responsive: mobile single column; tablet 2–3 KPI columns; desktop 5 KPI columns.
- Accessible focus rings (`focus-visible:ring-2`) and 150 ms transitions.
