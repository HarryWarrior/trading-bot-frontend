<template>
  <div class="comparison-stats" v-if="stats">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-label">Operaciones</div>
          <div class="stat-value">{{ stats.selectedCount }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-label">P&L Total</div>
          <div :class="['stat-value', stats.totalPnL >= 0 ? 'positive' : 'negative']">
            {{ formatCurrency(stats.totalPnL) }}
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <div class="stat-label">P&L Promedio</div>
          <div :class="['stat-value', stats.avgPnL >= 0 ? 'positive' : 'negative']">
            {{ formatCurrency(stats.avgPnL) }}
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-label">Win Rate</div>
          <div class="stat-value">{{ stats.winRate.toFixed(1) }}%</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⚖️</div>
        <div class="stat-content">
          <div class="stat-label">R:R Promedio</div>
          <div class="stat-value">{{ stats.avgRR.toFixed(2) }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <div class="stat-label">Duración Promedio</div>
          <div class="stat-value">{{ formatDuration(stats.avgDuration) }}</div>
        </div>
      </div>

      <div class="stat-card highlight best">
        <div class="stat-icon">🏆</div>
        <div class="stat-content">
          <div class="stat-label">Mejor Operación</div>
          <div class="stat-value positive">{{ formatCurrency(stats.bestTrade.profit_usd) }}</div>
          <div class="stat-meta">{{ stats.bestTrade.symbol }}</div>
        </div>
      </div>

      <div class="stat-card highlight worst">
        <div class="stat-icon">⚠️</div>
        <div class="stat-content">
          <div class="stat-label">Peor Operación</div>
          <div class="stat-value negative">{{ formatCurrency(stats.worstTrade.profit_usd) }}</div>
          <div class="stat-meta">{{ stats.worstTrade.symbol }}</div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="comparison-stats-empty">
    <p>Selecciona operaciones para ver estadísticas comparativas</p>
  </div>
</template>

<script setup lang="ts">
import type { ComparisonStats } from '~/types/analytics.extended'

defineProps<{
  stats: ComparisonStats | null
}>()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' }).format(val)
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
</script>

<style scoped>
.comparison-stats {
  background-color: #111827;
  border-top: 1px solid #374151;
  padding: 1rem 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}

.stat-card {
  background-color: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: #4b5563;
  transform: translateY(-1px);
}

.stat-card.highlight {
  border-width: 2px;
}

.stat-card.best {
  border-color: rgba(16, 185, 129, 0.5);
  background-color: rgba(16, 185, 129, 0.05);
}

.stat-card.worst {
  border-color: rgba(239, 68, 68, 0.5);
  background-color: rgba(239, 68, 68, 0.05);
}

.stat-icon {
  font-size: 1.5rem;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 0.65rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: #e5e7eb;
  font-family: monospace;
}

.stat-value.positive {
  color: #10b981;
}

.stat-value.negative {
  color: #ef4444;
}

.stat-meta {
  font-size: 0.7rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.comparison-stats-empty {
  background-color: #111827;
  border-top: 1px solid #374151;
  padding: 2rem;
  text-align: center;
}

.comparison-stats-empty p {
  color: #6b7280;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
  
  .stat-value {
    font-size: 0.875rem;
  }
}
</style>
