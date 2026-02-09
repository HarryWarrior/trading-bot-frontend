<template>
  <div class="comparison-grid" :class="gridClass">
    <TradeChartMini
      v-for="trade in selectedTrades"
      :key="trade.id"
      :trade="trade"
      :height="chartHeight"
      :timeframe="timeframe"
      :showControls="true"
    />
    
    <!-- Empty slots if less than max -->
    <div 
      v-for="i in emptySlots" 
      :key="`empty-${i}`"
      class="empty-slot"
    >
      <div class="empty-slot-content">
        <div class="empty-icon">📊</div>
        <p>Selecciona una operación</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TradeComparison } from '~/types/analytics.extended'
import type { ViewMode } from '~/types/analytics.extended'
import TradeChartMini from './TradeChartMini.vue'

const props = defineProps<{
  selectedTrades: TradeComparison[]
  viewMode: ViewMode
  timeframe: string
}>()

// Grid layout classes based on view mode
const gridClass = computed(() => {
  const layouts: Record<ViewMode, string> = {
    '1x1': 'grid-1x1',
    '2x1': 'grid-2x1',
    '3x1': 'grid-3x1',
    '2x2': 'grid-2x2',
    '1x2': 'grid-1x2',
    '1x3': 'grid-1x3'
  }
  return layouts[props.viewMode]
})

// Calculate chart height based on view mode
const chartHeight = computed(() => {
  const heights: Record<ViewMode, number> = {
    '1x1': 500,
    '2x1': 400,
    '3x1': 350,
    '2x2': 350,
    '1x2': 350,
    '1x3': 300
  }
  return heights[props.viewMode]
})

// Calculate number of empty slots to show
const emptySlots = computed(() => {
  const maxSlots: Record<ViewMode, number> = {
    '1x1': 1,
    '2x1': 2,
    '3x1': 3,
    '2x2': 4,
    '1x2': 2,
    '1x3': 3
  }
  const max = maxSlots[props.viewMode]
  const current = props.selectedTrades.length
  return Math.max(0, max - current)
})
</script>

<style scoped>
.comparison-grid {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
  background-color: #111827;
}

/* Grid Layout Classes */
.grid-1x1 {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.grid-2x1 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr;
}

.grid-3x1 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 1fr;
}

.grid-2x2 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.grid-1x2 {
  grid-template-columns: 1fr;
  grid-template-rows: repeat(2, 1fr);
}

.grid-1x3 {
  grid-template-columns: 1fr;
  grid-template-rows: repeat(3, 1fr);
}

.empty-slot {
  background-color: #1f2937;
  border: 2px dashed #374151;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  transition: all 0.2s ease;
}

.empty-slot:hover {
  border-color: #4b5563;
  background-color: rgba(59, 130, 246, 0.05);
}

.empty-slot-content {
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.3;
  margin-bottom: 0.5rem;
}

.empty-slot-content p {
  font-size: 0.875rem;
  opacity: 0.7;
}

/* Scrollbar Styling */
.comparison-grid::-webkit-scrollbar {
  width: 8px;
}

.comparison-grid::-webkit-scrollbar-track {
  background-color: #111827;
}

.comparison-grid::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 4px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .grid-3x1 {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto;
  }
}

@media (max-width: 768px) {
  .grid-2x1,
  .grid-3x1,
  .grid-2x2 {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  
  .comparison-grid {
    gap: 0.75rem;
    padding: 0.75rem;
  }
}
</style>
