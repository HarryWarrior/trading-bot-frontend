<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <!-- Top Toolbar -->
      <div class="modal-toolbar">
        <div class="toolbar-left">
          <h2 class="modal-title">Comparación de Operaciones</h2>
          <span class="subtitle">{{ selectedTrades.length }} de {{ trades.length }} operaciones</span>
        </div>

        <div class="toolbar-center">
          <!-- Layout Switcher -->
          <div class="layout-switcher">
            <button
              v-for="layout in layouts"
              :key="layout.mode"
              :class="['layout-btn', { active: viewMode === layout.mode }]"
              @click="setViewMode(layout.mode)"
              :title="layout.label"
            >
              <span class="layout-icon">{{ layout.icon }}</span>
            </button>
          </div>

          <!-- Timeframe Selector -->
          <div class="timeframe-selector">
            <button
              v-for="tf in timeframes"
              :key="tf.value"
              :class="['tf-btn', { active: currentTimeframe === tf.value }]"
              @click="currentTimeframe = tf.value"
            >
              {{ tf.label }}
            </button>
          </div>
        </div>

        <div class="toolbar-right">
          <!-- Sync Controls -->
          <button
            :class="['control-btn', { active: syncTimeframe }]"
            @click="syncTimeframe = !syncTimeframe"
            title="Sincronizar timeframes"
          >
            🔗 TF
          </button>
          
          <!-- Close Button -->
          <button @click="closeModal" class="close-btn" title="Cerrar (Esc)">
            ✕
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="modal-content">
        <!-- Sidebar: Trades List -->
        <div :class="['sidebar', { collapsed: isSidebarCollapsed }]">
          <button @click="toggleSidebar" class="sidebar-toggle">
            {{ isSidebarCollapsed ? '▶' : '◀' }}
          </button>
          
          <TradesList
            v-if="!isSidebarCollapsed"
            :trades="trades"
            :selectedIds="selectedIds"
            :selectedTrades="selectedTrades"
            @toggle="toggleSelection"
            @clearSelection="clearSelection"
            @updateFilter="updateFilters({ status: $event })"
          />
        </div>

        <!-- Main Area: Comparison Grid -->
        <div class="main-area">
          <ComparisonGrid
            :selectedTrades="selectedTrades"
            :viewMode="viewMode"
            :timeframe="currentTimeframe"
          />
        </div>
      </div>

      <!-- Bottom Panel: Aggregated Statistics -->
      <ComparisonStats :stats="comparisonStats" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Trade } from '~/types/analytics'
import type { ViewMode } from '~/types/analytics.extended'
import { useTradeComparison } from '~/composables/useTradeComparison'
import TradesList from './TradesList.vue'
import ComparisonGrid from './ComparisonGrid.vue'
import ComparisonStats from './ComparisonStats.vue'

const props = withDefaults(defineProps<{
  trades: Trade[]
  initialSelection?: number[]
}>(), {
  initialSelection: () => []
})

const emit = defineEmits<{
  close: []
}>()

// Initialize composable
const tradesRef = ref(props.trades)
const {
  selectedIds,
  viewMode,
  filters,
  syncZoom,
  syncTimeframe,
  currentTimeframe,
  selectedTrades,
  filteredTrades,
  comparisonStats,
  toggleSelection,
  clearSelection,
  navigateNext,
  navigatePrev,
  updateFilters,
  setViewMode,
  autoAdjustViewMode
} = useTradeComparison(tradesRef)

// UI State
const isSidebarCollapsed = ref(false)

// Layout options
const layouts = [
  { mode: '1x1' as ViewMode, label: '1 Gráfico', icon: '⬜' },
  { mode: '2x1' as ViewMode, label: '2 Gráficos', icon: '▦' },
  { mode: '3x1' as ViewMode, label: '3 Gráficos', icon: '☰' },
  { mode: '2x2' as ViewMode, label: '4 Gráficos', icon: '▧' }
]

// Timeframe options
const timeframes = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' }
]

// Initialize with initial selection if provided
onMounted(() => {
  if (props.initialSelection.length > 0) {
    props.initialSelection.forEach(id => {
      if (selectedIds.value.size < 4) {
        selectedIds.value.add(id)
      }
    })
    autoAdjustViewMode()
  }

  // Add keyboard event listeners
  window.addEventListener('keydown', handleKeyboard)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard)
})

// Keyboard navigation
const handleKeyboard = (e: KeyboardEvent) => {
  // Ignore if typing in input
  if ((e.target as HTMLElement)?.tagName === 'INPUT') return

  switch (e.key) {
    case 'Escape':
      closeModal()
      break
    case 'ArrowRight':
      e.preventDefault()
      navigateNext()
      break
    case 'ArrowLeft':
      e.preventDefault()
      navigatePrev()
      break
    case ' ':
      e.preventDefault()
      // Space bar toggles the first filtered trade if none selected
      if (selectedIds.value.size === 0 && filteredTrades.value.length > 0) {
        toggleSelection(filteredTrades.value[0].id)
      }
      break
  }
}

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(6px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  width: 95vw;
  height: 90vh;
  background-color: #111827;
  border-radius: 0.75rem;
  border: 1px solid #374151;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Toolbar */
.modal-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #1f2937;
  border-bottom: 1px solid #374151;
  gap: 1rem;
}

.toolbar-left {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f3f4f6;
  margin: 0;
}

.subtitle {
  font-size: 0.875rem;
  color: #9ca3af;
}

.toolbar-center {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.layout-switcher {
  display: flex;
  gap: 0.25rem;
  background-color: #111827;
  padding: 0.25rem;
  border-radius: 0.5rem;
  border: 1px solid #374151;
}

.layout-btn {
  padding: 0.5rem 0.75rem;
  background-color: transparent;
  color: #9ca3af;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.125rem;
}

.layout-btn:hover {
  background-color: #374151;
  color: #e5e7eb;
}

.layout-btn.active {
  background-color: #3b82f6;
  color: white;
}

.timeframe-selector {
  display: flex;
  gap: 0.25rem;
  background-color: #111827;
  padding: 0.25rem;
  border-radius: 0.5rem;
  border: 1px solid #374151;
}

.tf-btn {
  padding: 0.375rem 0.625rem;
  background-color: transparent;
  color: #9ca3af;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.2s;
}

.tf-btn:hover {
  background-color: #374151;
  color: #e5e7eb;
}

.tf-btn.active {
  background-color: #3b82f6;
  color: white;
}

.toolbar-right {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.control-btn {
  padding: 0.5rem 0.75rem;
  background-color: #374151;
  color: #9ca3af;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.control-btn:hover {
  background-color: #4b5563;
  color: #e5e7eb;
}

.control-btn.active {
  background-color: #10b981;
  color: white;
}

.close-btn {
  padding: 0.5rem 0.75rem;
  background-color: transparent;
  color: #9ca3af;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;
}

.close-btn:hover {
  color: #ef4444;
}

/* Main Content Area */
.modal-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 320px;
  background-color: #1f2937;
  border-right: 1px solid #374151;
  display: flex;
  position: relative;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 48px;
}

.sidebar-toggle {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background-color: #374151;
  color: #9ca3af;
  border: none;
  padding: 0.5rem 0.25rem;
  cursor: pointer;
  z-index: 10;
  border-radius: 0.25rem 0 0 0.25rem;
  transition: all 0.2s;
}

.sidebar-toggle:hover {
  background-color: #4b5563;
  color: #e5e7eb;
}

.main-area {
  flex: 1;
  overflow: hidden;
  background-color: #111827;
}

/* Responsive */
@media (max-width: 1024px) {
  .modal-container {
    width: 98vw;
    height: 95vh;
  }

  .sidebar {
    width: 280px;
  }

  .toolbar-center {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 768px) {
  .modal-toolbar {
    flex-wrap: wrap;
  }

  .toolbar-left {
    flex-basis: 100%;
  }

  .sidebar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 20;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
  }

  .sidebar.collapsed {
    width: 0;
  }
}
</style>
