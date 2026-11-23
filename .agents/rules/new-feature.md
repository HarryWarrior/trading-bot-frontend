# Creating a new feature

## Before

1. A spec exists in `specs/NNN-slug/` (approved), linked to the backend spec of the same number.
2. The backend endpoints exist or are specified (`Trading-bot-backend/docs/services-catalog.md`).
3. Check `docs/features-catalog.md`: the capability is not already owned by another feature.

## Steps

```bash
cp -r features/_template features/journal
```

1. Rename files and symbols: `templateApi` → `journalApi`, `useTemplateItemsStore` →
   `useJournalTradesStore`, `useTemplateItems` → `useJournalTrades`, `TemplateItemList.vue` →
   `JournalTradeList.vue`; store id `'templateItems'` → `'journalTrades'`.
2. Replace the sample DTOs/types with the backend contract of your service. Map snake_case → camelCase
   only in `api/`.
3. Build components with `components/Common/App*` primitives and `.agents/rules/ui-standards.md`.
4. Export the public surface from `index.ts`.
5. Add or update the page in `pages/` (thin) and the navigation (`AppSidebar`).
6. Add i18n keys (en + es) to `stores/i18n.ts`.
7. Add the feature to `docs/features-catalog.md`.
8. Verify:

```bash
npm run build
npm run dev   # open the page; check loading, empty, error and data states
```

## Naming

| Thing | Convention | Example |
|---|---|---|
| Folder | kebab-case | `features/mt5-connection` |
| Component | PascalCase, feature prefix | `Mt5ConnectionStatus.vue` |
| Composable | `use` + feature + noun | `useMt5Connection` |
| Store | `use…Store`, id camelCase | `useMt5ConnectionStore`, `'mt5Connection'` |
| API module | camelCase + `Api` | `mt5BridgeApi` |
