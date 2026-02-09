import { ref, computed, type Ref } from 'vue'
import type { Trade } from '~/types/analytics'
import type {
    TradeComparison,
    ViewMode,
    TradeFilters,
    ComparisonStats
} from '~/types/analytics.extended'

/**
 * Composable for managing trade comparison state and logic
 */
export const useTradeComparison = (trades: Ref<Trade[]>) => {
    // ============= State =============
    const selectedIds = ref<Set<number>>(new Set())
    const viewMode = ref<ViewMode>('2x1')
    const filters = ref<TradeFilters>({ status: 'ALL' })
    const syncZoom = ref(false)
    const syncTimeframe = ref(true)
    const currentTimeframe = ref('5m')

    // Color palette for visual identification of trades
    const colorPalette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

    // Maximum number of simultaneous trades to compare
    const MAX_SELECTIONS = 4

    // ============= Computed =============

    /**
     * Get selected trades with comparison metadata (color, index)
     */
    const selectedTrades = computed<TradeComparison[]>(() => {
        return Array.from(selectedIds.value)
            .map((id, index) => {
                const trade = trades.value.find(t => t.id === id)
                if (!trade) return null

                return {
                    ...trade,
                    isSelected: true,
                    colorCode: colorPalette[index % colorPalette.length],
                    viewIndex: index
                } as TradeComparison
            })
            .filter((t): t is TradeComparison => t !== null)
            .slice(0, MAX_SELECTIONS)
    })

    /**
     * Apply filters and search to trade list
     */
    const filteredTrades = computed(() => {
        let result = trades.value

        // Apply status filter
        if (filters.value.status && filters.value.status !== 'ALL') {
            result = result.filter(t => t.status === filters.value.status)
        }

        // Apply symbol filter
        if (filters.value.symbols && filters.value.symbols.length > 0) {
            result = result.filter(t => filters.value.symbols!.includes(t.symbol))
        }

        // Apply date range filter
        if (filters.value.dateRange) {
            const { start, end } = filters.value.dateRange
            result = result.filter(t => {
                const tradeDate = new Date(t.open_time)
                return tradeDate >= new Date(start) && tradeDate <= new Date(end)
            })
        }

        // Apply search query
        if (filters.value.searchQuery) {
            const query = filters.value.searchQuery.toLowerCase()
            result = result.filter(t =>
                t.symbol.toLowerCase().includes(query) ||
                t.id.toString().includes(query)
            )
        }

        return result
    })

    /**
     * Calculate aggregated statistics for selected trades
     */
    const comparisonStats = computed<ComparisonStats | null>(() => {
        const selected = selectedTrades.value
        if (selected.length === 0) return null

        const totalPnL = selected.reduce((sum, t) => sum + t.profit_usd, 0)
        const winners = selected.filter(t => t.profit_usd > 0).length
        const winRate = (winners / selected.length) * 100

        // Calculate average R:R (simplified estimation)
        const avgRR = selected.reduce((sum, t) => {
            const risk = Math.abs(t.open_price - t.close_price)
            const reward = Math.abs(t.profit_usd)
            return sum + (reward / (risk || 1))
        }, 0) / selected.length

        const bestTrade = selected.reduce((best, t) =>
            t.profit_usd > best.profit_usd ? t : best
        )

        const worstTrade = selected.reduce((worst, t) =>
            t.profit_usd < worst.profit_usd ? t : worst
        )

        return {
            selectedCount: selected.length,
            totalPnL,
            avgPnL: totalPnL / selected.length,
            winRate,
            avgRR,
            avgDuration: selected.reduce((sum, t) => sum + t.duration, 0) / selected.length,
            bestTrade,
            worstTrade
        }
    })

    /**
     * Check if a trade is currently selected
     */
    const isSelected = (id: number): boolean => {
        return selectedIds.value.has(id)
    }

    // ============= Methods =============

    /**
     * Toggle selection of a trade
     */
    const toggleSelection = (id: number) => {
        if (selectedIds.value.has(id)) {
            selectedIds.value.delete(id)
        } else if (selectedIds.value.size < MAX_SELECTIONS) {
            selectedIds.value.add(id)
        } else {
            // Max selections reached - optionally replace oldest
            console.warn(`Máximo de ${MAX_SELECTIONS} operaciones seleccionadas`)
        }
    }

    /**
     * Select multiple trades at once
     */
    const selectMultiple = (ids: number[]) => {
        selectedIds.value.clear()
        ids.slice(0, MAX_SELECTIONS).forEach(id => selectedIds.value.add(id))
    }

    /**
     * Clear all selections
     */
    const clearSelection = () => {
        selectedIds.value.clear()
    }

    /**
     * Navigate to next trade in filtered list
     */
    const navigateNext = () => {
        if (filteredTrades.value.length === 0) return

        const currentIds = Array.from(selectedIds.value)
        if (currentIds.length === 0) {
            // No selection, select first trade
            selectedIds.value.add(filteredTrades.value[0].id)
            return
        }

        const lastId = currentIds[currentIds.length - 1]
        const currentIndex = filteredTrades.value.findIndex(t => t.id === lastId)
        const nextIndex = (currentIndex + 1) % filteredTrades.value.length
        const nextTrade = filteredTrades.value[nextIndex]

        if (nextTrade) {
            if (currentIds.length === 1) {
                // Single selection mode - replace
                selectedIds.value.clear()
                selectedIds.value.add(nextTrade.id)
            } else {
                // Multi selection mode - add if possible
                if (selectedIds.value.size < MAX_SELECTIONS) {
                    selectedIds.value.add(nextTrade.id)
                }
            }
        }
    }

    /**
     * Navigate to previous trade in filtered list
     */
    const navigatePrev = () => {
        if (filteredTrades.value.length === 0) return

        const currentIds = Array.from(selectedIds.value)
        if (currentIds.length === 0) {
            // No selection, select last trade
            selectedIds.value.add(filteredTrades.value[filteredTrades.value.length - 1].id)
            return
        }

        const firstId = currentIds[0]
        const currentIndex = filteredTrades.value.findIndex(t => t.id === firstId)
        const prevIndex = currentIndex - 1 < 0
            ? filteredTrades.value.length - 1
            : currentIndex - 1
        const prevTrade = filteredTrades.value[prevIndex]

        if (prevTrade) {
            if (currentIds.length === 1) {
                // Single selection mode - replace
                selectedIds.value.clear()
                selectedIds.value.add(prevTrade.id)
            } else {
                // Multi selection mode - add if possible
                if (selectedIds.value.size < MAX_SELECTIONS) {
                    selectedIds.value.add(prevTrade.id)
                }
            }
        }
    }

    /**
     * Update filter configuration
     */
    const updateFilters = (newFilters: Partial<TradeFilters>) => {
        filters.value = { ...filters.value, ...newFilters }
    }

    /**
     * Change view mode (grid layout)
     */
    const setViewMode = (mode: ViewMode) => {
        viewMode.value = mode
    }

    /**
     * Auto-adjust view mode based on number of selections
     */
    const autoAdjustViewMode = () => {
        const count = selectedIds.value.size
        if (count === 1) viewMode.value = '1x1'
        else if (count === 2) viewMode.value = '2x1'
        else if (count === 3) viewMode.value = '3x1'
        else if (count === 4) viewMode.value = '2x2'
    }

    return {
        // State
        selectedIds,
        viewMode,
        filters,
        syncZoom,
        syncTimeframe,
        currentTimeframe,

        // Computed
        selectedTrades,
        filteredTrades,
        comparisonStats,
        isSelected,

        // Methods
        toggleSelection,
        selectMultiple,
        clearSelection,
        navigateNext,
        navigatePrev,
        updateFilters,
        setViewMode,
        autoAdjustViewMode
    }
}
