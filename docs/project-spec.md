# Project Specification (Project Spec) - Trading Bot Frontend

> **Target Audience for this Document:** AI Agents, Frontend Engineers, and UI/UX Architects developing, styling, and scaling the Trading Bot Frontend application.

---

## 1. Product Vision & User Interface Overview

The **Trading Bot Frontend** is a professional financial intelligence workstation built with **Nuxt 3**, **Vue 3 (Composition API)**, and **Tailwind CSS**. It provides traders and algorithmic fund managers with real-time portfolio visualization, historical trade statement ingestion (MT5 CSV/XLSX), risk factor auditing, equity trajectory analysis, and side-by-side trade comparison.

The interface is architected according to **SOLID Principles**, **Atomic Component Design**, **Scalable Internationalization (i18n)**, **Universal UI Design Tokens**, and **Standardized Pagination & Search UX**.

---

## 2. SOLID Design Principles for Vue 3 & Nuxt 3

1. **Single Responsibility Principle (SRP):**
   * Visual components (`components/`) strictly render UI and emit events.
   * State and business logic are segregated into **Composables** (`composables/`) and **Pinia Stores** (`stores/`).
   * Pages (`pages/`) only compose high-level views and coordinate lifecycle hooks.
2. **Open/Closed Principle (OCP):**
   * Reusable UI primitives (`<AppButton>`, `<AppIcon>`, `<AppFileDropzone>`, `<AppTooltip>`, `<AppPagination>`) are open for visual and behavioral extension via slots, variant props, and custom directives without modifying internal component logic.
3. **Liskov Substitution Principle (LSP):**
   * Specialized chart components (e.g., `<EquityCurveChart>`, `<TradeChartMini>`) implement uniform property contracts for dataset inputs.
4. **Interface Segregation Principle (ISP):**
   * Fine-grained TypeScript interfaces (`types/analytics.ts`, `types/analytics.extended.ts`) ensure components only bind to necessary data slices.
5. **Dependency Inversion Principle (DIP):**
   * UI components consume reactive state via Pinia store abstractions and generic composable hooks rather than raw HTTP fetch calls.

---

## 3. Reusable Component & UI Design System Standards

### 3.1 Standardized Action Buttons & States

All action buttons must adhere to unified variant tokens and responsive states:

| Action / Variant | Class Tokens | Icon Standard | Behavior |
| :--- | :--- | :--- | :--- |
| **Add / Create** | `btn btn-success` / `btn btn-primary` | Plus (`+`) / Upload (`📤`) | Triggers creation modal or upload pipeline. |
| **Delete / Remove** | `btn btn-danger` | Trash can (`🗑️` / `trash-2`) | Requires double-confirmation dialog before destructive action. |
| **Edit / Update** | `btn btn-warning` / `btn btn-secondary` | Pencil (`✏️` / `edit-3`) | Opens inline or modal editing state. |
| **Filter / Query** | `btn btn-subtle` | Search / Filter (`🔍` / `sliders`) | Toggles filter panels or applies table criteria. |
| **Loading State** | `btn is-loading disabled` | Spinner (`⏳` / `loader-2`) | Disables pointer events and displays loading indicator. |

### 3.2 Standardized Pagination & Search Contract (`<AppPagination>`)
* **Pagination Component:**
  * Displays arrow controls (`← Previous`, `Next →`), current page indicator (`Page X of Y`), and page size selector (`20`, `50`, `100`).
  * Emits `@change-page(newPage)` and `@change-page-size(newSize)`.
  * Supports an optional toggle for **Infinite Scroll** mode.
* **Debounced Search Inputs:**
  * All search inputs must incorporate a `300ms` debounce (`useDebounceFn`) before triggering API queries to prevent network spam.

### 3.3 Intuitive Iconography & Visual Language ([Lucide Icons](https://lucide.dev/icons/))
* **Official Icon Library:** All UI components, buttons, tables, and navigation links MUST use **Lucide Icons** (`lucide-vue-next` / `https://lucide.dev/icons/`).
* **Standard Lucide Icons by Context:**
  * **Deletion / Removal:** `Trash2` icon (`<Trash2 class="w-4 h-4 text-red-500" />`).
  * **Trend & Direction:** `TrendingUp` / `ArrowUpRight` (green) for positive P&L; `TrendingDown` / `ArrowDownRight` (red) for drawdown.
  * **Actions:** `Plus` (Add), `Upload` (File Import), `Pencil` (Edit), `Search` (Query), `Copy` (Clipboard), `Download` (Export).
  * **Navigation:** `BarChart3` (Analytics), `BookOpen` (Journal), `Globe` (Domains/Brokers), `Settings` (Configuration), `HelpCircle` (Tooltips).
  * **Security & Auth:** `Lock` (Password), `Mail` (Email), `User` (Profile), `Eye` / `EyeOff` (Password toggle).
* **Status Badges:**
  * `GANADOR` / `WINNER`: Emerald badge with `TrendingUp` (`bg-emerald-950 text-emerald-300 border-emerald-500`).
  * `PERDEDOR` / `LOSER`: Rose badge with `TrendingDown` (`bg-rose-950 text-rose-300 border-rose-500`).
  * `BREAK_EVEN`: Slate/Cyan badge with `Minus` (`bg-slate-800 text-slate-300 border-slate-600`).
* **Paging & Sorting:** Sort arrows (`ArrowUpDown`, `ChevronUp`, `ChevronDown`, `ChevronLeft`, `ChevronRight`).

### 3.4 Universal Drag & Drop File Upload Standard (`<AppFileDropzone>`)
* **States:** Default border, drag-over highlight with glowing border, processing state with spinner, success banner, and error alert.
* **Validation:** Enforces `.csv` / `.xlsx` format and $\le 10\text{MB}$ file size before dispatching HTTP payloads.
* **Fallback:** Clicking anywhere on the dropzone triggers native OS file selection.

### 3.5 Contextual Tooltip System (`v-tooltip` / `<AppTooltip>`)
* Provides instantaneous, accessible financial definitions on hover/focus for technical trading terms (e.g., *Profit Factor = Total Gross Profits / Total Gross Losses*, *Max Drawdown = Peak-to-valley equity decline*).

### 3.6 Skeleton Loaders & Anti-Flicker Architecture (`<AppSkeleton>`)
* Mandatory placeholder skeletons during asynchronous state resolution to eliminate layout shifts and white flashes.

### 3.7 Scalable Multi-Language Architecture (i18n)
* Governed by a dedicated reactive i18n store (`stores/i18n.ts` or `composables/useI18n.ts`).
* Fully typed dictionary keys supporting dynamic runtime switching between **English (`en`)** and **Spanish (`es`)**.
* Default application locale: English.

### 3.8 Dub.co / Modern SaaS Design Tokens & Aesthetic Standards
* **Micro-Borders & Subtle Shadows:**
  * All cards, containers, and popovers utilize `1px` subtle borders (`border-zinc-200 dark:border-zinc-800`) combined with diffused multi-layer shadows (`shadow-card` / `shadow-subtle`).
  * Modal overlays use backdrop blur filters (`backdrop-blur-sm bg-black/50`).
* **Interactive States & Focus Rings:**
  * Interactive components must implement high-contrast accessible focus indicators: `focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-100 focus-visible:ring-offset-2`.
  * Hover transitions strictly use ultra-crisp `150ms` easing (`transition-all duration-150 ease-in-out`).

### 3.9 Reusable Component Library Catalog (`components/Common/`)
* **`<AppButton>`:** Universal button primitive with `variant` (`primary`, `secondary`, `danger`, `success`, `warning`, `subtle`), `size` (`xs`, `sm`, `md`, `lg`), `loading` spinner, and `startIcon`/`endIcon` slots.
* **`<AppInput>`:** Form input primitive featuring accessible labels, error/hint messaging, micro-borders, and **mandatory interactive eye password visibility toggle (`👁️` / `🙈`)** conforming to security directives.
* **`<AppBadge>`:** Semantic indicator pill supporting `variant` (`success`, `danger`, `warning`, `info`, `primary`, `neutral`), optional live status `dot`, and icon slots.
* **`<AppMetricCard>`:** Institutional KPI card featuring financial acronym tooltips (`<AppTooltip>`), delta percentage trend badges, and high-precision typography.
* **`<AppModal>`:** Accessible teleported dialog with backdrop blur, keyboard `Escape` dismissal, and configurable max-width.
* **`<AppConfirmDeleteModal>`:** Double-confirmation destructive modal enforcing typed resource name confirmation before allowing permanent deletions.
* **`<AppEmptyState>`:** Dashed-border empty view placeholder (`border-dashed border-2 border-zinc-200 dark:border-zinc-800`) with illustration icon and direct CTA action.
* **`<AppHeader>`:** Global workstation header integrating workspace switcher, command search trigger (`⌘K`), i18n locale switch, notifications, and profile menu.
* **`<AppSidebar>`:** Collapsible navigation rail with active indicator pill, usage progress meter, and documentation links.
* **`<AppAuthCard>`:** Multi-mode Login/Registration authentication card with OAuth buttons, eye toggle inputs, and password strength validation indicators.

### 3.10 Dark Theme, Color Customization & Responsive Layouts
* **Tailwind Color Palette:** Neutral base built on `zinc` scale with semantic highlights for financial calculations (`--color-profit`, `--color-loss`, `--color-neutral`).
* **Responsive Breakpoints:**
  * Mobile (`< 640px`): Single-column stacked cards, collapsed tables.
  * Tablet (`640px - 1024px`): 2-3 column KPI ribbon, horizontal scrolling table.
  * Desktop (`≥ 1024px`): 5-column KPI ribbon, multi-chart side-by-side grid.

---

## 4. Coding & AI Agent Development Rules

1. **Language Standard:**
   * **ALL** component names, template markup, script code, composables, store actions, props, TypeScript types, docstrings, and UI translation keys MUST be written in **English**.
2. **Comment Policy:**
   * **STRICTLY FORBIDDEN:** Obvious comments (e.g., `// render template`, `// click handler`, `// define store`).
   * **MANDATORY:** Comments are ONLY allowed for complex charting transformations (Plotly data structures, canvas/SVG coordinate mapping, or multi-chart synchronizers).
3. **Component Structure:**
   * Single-File Components (`.vue`) must follow the order: `<template>`, `<script setup lang="ts">`, `<style scoped>`.
