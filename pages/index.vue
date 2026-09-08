<template>
  <div class="relative min-h-screen flex flex-col justify-between p-6 sm:p-12 overflow-hidden">
    <!-- Subtle Background Gradient Glow -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(0,0,0,0))] pointer-events-none" />

    <!-- Top Navigation -->
    <header class="relative z-10 flex items-center justify-between max-w-6xl w-full mx-auto pb-8 border-b border-zinc-200/60 dark:border-zinc-800/60">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm shadow-subtle">
          ✦
        </div>
        <div class="flex items-center gap-2">
          <span class="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            TradingBot
          </span>
          <AppBadge variant="neutral" size="xs">
            v1.1
          </AppBadge>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <!-- Theme Toggle -->
        <AppThemeToggle />

        <!-- Language Switcher -->
        <div class="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg border border-zinc-200 dark:border-zinc-700/60">
          <button
            @click="setLocale('en')"
            :class="['px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer', locale === 'en' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-subtle' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200']"
          >
            EN
          </button>
          <button
            @click="setLocale('es')"
            :class="['px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer', locale === 'es' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-subtle' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200']"
          >
            ES
          </button>
        </div>

        <NuxtLink to="/journal">
          <AppButton variant="secondary" size="sm">
            {{ t('nav.journal') }}
          </AppButton>
        </NuxtLink>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="relative z-10 max-w-4xl mx-auto text-center my-16 sm:my-24 space-y-6">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/60 shadow-subtle">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Institutional Algorithmic Intelligence</span>
      </div>

      <h1 class="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-3xl mx-auto leading-tight">
        Precision Analytics for Quantitative Traders
      </h1>

      <p class="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
        Ingest MT5 execution statements, audit real-time portfolio risk factors, model equity trajectories, and compare strategy execution with microsecond clarity.
      </p>

      <!-- CTA Buttons -->
      <div class="flex items-center justify-center gap-3 pt-4 flex-wrap">
        <AppButton
          variant="primary"
          size="lg"
          @click="showMt5Modal = true"
        >
          <template #startIcon>
            <span>🔗</span>
          </template>
          {{ t('nav.connect_mt5') }}
        </AppButton>

        <NuxtLink to="/journal">
          <AppButton variant="secondary" size="lg">
            <template #startIcon>
              <span>📊</span>
            </template>
            {{ t('nav.journal') }}
          </AppButton>
        </NuxtLink>

        <NuxtLink to="/upload">
          <AppButton variant="subtle" size="lg">
            <template #startIcon>
              <span>📤</span>
            </template>
            {{ t('nav.upload') }}
          </AppButton>
        </NuxtLink>
      </div>
    </main>

    <!-- Feature Grid -->
    <section class="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="dub-card p-5 space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
        <div class="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-2">
          <span>📊</span>
        </div>
        <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {{ t('kpi.profit_factor') }} & Risk KPIs
        </h3>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {{ t('tooltip.profit_factor') }}
        </p>
      </div>

      <div class="dub-card p-5 space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
        <div class="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-2">
          <span>📈</span>
        </div>
        <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {{ t('chart.equity_curve') }}
        </h3>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Interactive balance time-series with peak-to-valley drawdown tracing and high-water marks.
        </p>
      </div>

      <div class="dub-card p-5 space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
        <div class="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-2">
          <span>📅</span>
        </div>
        <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {{ t('chart.heatmap') }}
        </h3>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Calendar performance mapping with 1-click day filtering and win/loss day intensity badges.
        </p>
      </div>

      <div class="dub-card p-5 space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
        <div class="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-2">
          <span>🕯️</span>
        </div>
        <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {{ t('chart.candlestick') }}
        </h3>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Lightweight charts candlestick modal with entry, exit, SL, and TP price target overlays.
        </p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative z-10 max-w-6xl w-full mx-auto pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
      <div>© 2026 TradingBot Intelligence Inc. All rights reserved.</div>
      <div class="flex items-center gap-4">
        <a href="#terms" class="hover:text-zinc-600 dark:hover:text-zinc-300">Terms</a>
        <a href="#privacy" class="hover:text-zinc-600 dark:hover:text-zinc-300">Privacy</a>
        <a href="https://github.com" target="_blank" class="hover:text-zinc-600 dark:hover:text-zinc-300">GitHub</a>
      </div>
    </footer>

    <!-- MT5 Connection Modal -->
    <AnalyticsMt5ConnectModal
      v-if="showMt5Modal"
      @close="showMt5Modal = false"
      @connected="navigateTo('/journal')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '~/composables/useI18n'
import AppButton from '~/components/Common/AppButton.vue'
import AppBadge from '~/components/Common/AppBadge.vue'
import AppThemeToggle from '~/components/Common/AppThemeToggle.vue'
import AnalyticsMt5ConnectModal from '~/components/Analytics/Mt5ConnectModal.vue'

const { t, locale, setLocale } = useI18n()
const showMt5Modal = ref(false)

useHead({
  title: 'Trading Bot Analytics - Institutional Intelligence'
})
</script>

<style scoped>
/* Component styles */
</style>
