# Vue and TypeScript style

## Language

**English only**: component names, props, types, code, translation keys, comments. User-facing text
goes through i18n (English + Spanish).

## Components

- Single-File Component block order: `<template>`, `<script setup lang="ts">`, `<style scoped>`.
- Composition API only (`<script setup>`); typed `defineProps<{...}>()` with `withDefaults`, typed
  `defineEmits<{...}>()`.
- Props down, events up. No mutation of props; use `v-model` with `update:x` events.
- Components stay small: extract a child when a template exceeds ~150 lines or repeats.
- Shared primitives are imported explicitly from `~/components/Common/` (current convention).

```vue
<template>
  <AppMetricCard :title="t('kpi.winRate')" :value="formattedWinRate" />
</template>

<script setup lang="ts">
const props = defineProps<{ winRate: number }>()
const formattedWinRate = computed(() => `${props.winRate.toFixed(2)}%`)
</script>
```

## TypeScript

- `strict` mode; no `any` (use `unknown` + narrowing). Explicit return types on exported functions.
- View types in camelCase; backend DTOs only inside `api/` files.
- Numbers shown to users are formatted (percentages 2 decimals, money with currency) — never raw floats.

## Comments

No trivial comments. Comment only complex chart transformations (Plotly structures, canvas/SVG
coordinates, chart synchronization) or non-obvious workarounds.

## Formatting

2-space indent, single quotes, no semicolons (match existing files). A linter (ESLint + Prettier) is
*(planned, frontend spec 001)*.
