<template>
  <div class="trades-list">
    <!-- Filters Bar -->
    <div class="filters-bar">
      <input 
        type="search" 
        v-model="searchQuery"
        placeholder="Buscar símbolo o ID..." 
        class="search-input"
      />
      
      <div class="filter-buttons">
        <button 
          :class="['filter-btn', { active: activeFilter === 'ALL' }]"
          @click="setFilter('ALL')"
        >
          Todas
        </button>
        <button 
          :class="['filter-btn winner', { active: activeFilter === 'GANADOR' }]"
          @click="setFilter('GANADOR')"
        >
          ✓ Ganadoras
        </button>
        <button 
          :class="['filter-btn loser', { active: activeFilter === 'PERDEDOR' }]"
          @click="setFilter('PERDEDOR')"
        >
          ✗ Perdedoras
        </button>
      </div>
    </div>

    <!-- Trades Container with Virtual Scrolling -->
    <div class="trades-container">
      <div 
        v-for="trade in filteredTrades" 
        :key="trade.id"
        :class="['trade-item', { selected: isSelected(trade.id) }]"
        @click="toggleSelection(trade.id)"
      >
        <div class="trade-checkbox">
          <input 
            type="checkbox" 
            :checked="isSelected(trade.id)"
            @click.stop="toggleSelection(trade.id)"
          />
          <div 
            v-if="isSelected(trade.id)" 
            class="color-indicator"
            :style="{ backgroundColor: getTradeColor(trade.id) }"
          ></div>
        </div>

        <div class="trade-details">
          <div class="trade-header">
            <span class="trade-symbol">{{ trade.symbol }}</span>
            <span :class="['trade-type', trade.order_type.toLowerCase()]">
              {{ trade.order_type }}
            </span>
          </div>
          
          <div class="trade-meta">
            <span class="trade-date">{{ formatDate(trade.open_time) }}</span>
          </div>
          
          <div class="trade-footer">
            <span :class="['trade-pnl', trade.profit_usd >= 0 ? 'positive' : 'negative']">
              {{ formatCurrency(trade.profit_usd) }}
            </span>
            <span class="trade-duration">{{ formatDuration(trade.duration) }}</span>
          </div>
        </div>
      </div>

      <div v-if="filteredTrades.length === 0" class="empty-state">
        <p>No se encontraron operaciones</p>
      </div>
    </div>

    <!-- Selection Summary -->
    <div class="selection-summary">
      <span>{{ selectedCount }} / {{ filteredTrades.length }} seleccionadas</span>
      <button 
        v-if="selectedCount > 0" 
        @click="clearAll"
        class="clear-btn"
      >
        Limpiar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Trade } from '~/types/analytics'

const props = defineProps<{
  trades: Trade[]
  selectedIds: Set<number>
  selectedTrades: any[] // TradeComparison[] but avoiding circular import
}>()

const emit = defineEmits<{
  toggle: [id: number]
  clearSelection: []
  updateFilter: [filter: string]
  updateSearch: [query: string]
}>()

const searchQuery = ref('')
const activeFilter = ref<'ALL' | 'GANADOR' | 'PERDEDOR' | 'BREAK_EVEN'>('ALL')

const filteredTrades = computed(() => {
  let result = props.trades

  // Apply status filter
  if (activeFilter.value !== 'ALL') {
    result = result.filter(t => t.status === activeFilter.value)
  }

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(t =>
      t.symbol.toLowerCase().includes(query) ||
      t.id.toString().includes(query)
    )
  }

  return result
})

const selectedCount = computed(() => props.selectedIds.size)

const isSelected = (id: number) => {
  return props.selectedIds.has(id)
}

const getTradeColor = (id: number) => {
  const trade = props.selectedTrades.find(t => t.id === id)
  return trade?.colorCode || '#3b82f6'
}

const toggleSelection = (id: number) => {
  emit('toggle', id)
}

const clearAll = () => {
  emit('clearSelection')
}

const setFilter = (filter: 'ALL' | 'GANADOR' | 'PERDEDOR' | 'BREAK_EVEN') => {
  activeFilter.value = filter
  emit('updateFilter', filter)
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })
}

const formatCurrency = (val: number) => {
  const formatted = new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val)
  return formatted
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}
</script>

<style scoped>
.trades-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #1f2937;
  border-right: 1px solid #374151;
}

.filters-bar {
  padding: 1rem;
  background-color: #111827;
  border-bottom: 1px solid #374151;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background-color: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.375rem;
  color: #e5e7eb;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: #111827;
}

.search-input::placeholder {
  color: #6b7280;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  flex: 1;
  min-width: fit-content;
  padding: 0.375rem 0.75rem;
  background-color: #374151;
  color: #9ca3af;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background-color: #4b5563;
  color: #e5e7eb;
}

.filter-btn.active {
  background-color: #3b82f6;
  color: white;
}

.filter-btn.winner.active {
  background-color: #10b981;
}

.filter-btn.loser.active {
  background-color: #ef4444;
}

.trades-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.trades-container::-webkit-scrollbar {
  width: 6px;
}

.trades-container::-webkit-scrollbar-track {
  background-color: #1f2937;
}

.trades-container::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 3px;
}

.trade-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #111827;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.trade-item:hover {
  background-color: #1f2937;
  border-color: #4b5563;
  transform: translateX(2px);
}

.trade-item.selected {
  border-color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
}

.trade-checkbox {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.trade-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.trade-details {
  flex: 1;
  min-width: 0;
}

.trade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.trade-symbol {
  font-weight: 700;
  font-size: 0.875rem;
  color: #e5e7eb;
}

.trade-type {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.trade-type.buy {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.trade-type.sell {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.trade-meta {
  font-size: 0.7rem;
  color: #6b7280;
  margin-bottom: 0.375rem;
}

.trade-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trade-pnl {
  font-weight: 700;
  font-size: 0.875rem;
  font-family: monospace;
}

.trade-pnl.positive {
  color: #10b981;
}

.trade-pnl.negative {
  color: #ef4444;
}

.trade-duration {
  font-size: 0.7rem;
  color: #9ca3af;
}

.empty-state {
  padding: 2rem 1rem;
  text-align: center;
}

.empty-state p {
  color: #6b7280;
  font-size: 0.875rem;
}

.selection-summary {
  padding: 0.75rem 1rem;
  background-color: #111827;
  border-top: 1px solid #374151;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #9ca3af;
}

.clear-btn {
  padding: 0.25rem 0.75rem;
  background-color: #374151;
  color: #d1d5db;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background-color: #ef4444;
  color: white;
}
</style>
