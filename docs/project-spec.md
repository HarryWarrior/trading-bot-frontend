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

### 3.3 Intuitive Iconography & Visual Language
* **Deletion / Removal:** Universal trash can symbol (`🗑️`).
* **Trend Indicators:** Upward green arrow (`↑`) for positive P&L / winning trades; downward red arrow (`↓`) for negative P&L / drawdown.
* **Status Badges:**
  * `GANADOR` / `WINNER`: Emerald badge (`bg-emerald-950 text-emerald-300 border-emerald-500`).
  * `PERDEDOR` / `LOSER`: Rose badge (`bg-rose-950 text-rose-300 border-rose-500`).
  * `BREAK_EVEN`: Slate/Cyan badge (`bg-slate-800 text-slate-300 border-slate-600`).
* **Paging & Sorting:** Sort arrows (`↕`, `▲`, `▼`) on table column headers.

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

### 3.8 Dark Theme, Color Customization & Responsive Layouts
* **Tailwind Color Palette:** Defined using CSS custom properties (`--color-bg-primary`, `--color-pnl-win`, `--color-pnl-loss`) to enable dynamic dark/light terminal themes.
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
