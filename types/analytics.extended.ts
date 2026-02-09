import type { Trade } from './analytics'

/**
 * Extended Trade interface with comparison metadata
 */
export interface TradeComparison extends Trade {
    isSelected: boolean
    colorCode: string // Visual identification color in multi-chart view
    viewIndex: number // Position in grid layout (0-3)
}

/**
 * Available view modes for the comparison grid
 */
export type ViewMode = '1x1' | '2x1' | '3x1' | '2x2' | '1x2' | '1x3'

/**
 * Filter configuration for trade list
 */
export interface TradeFilters {
    status?: 'GANADOR' | 'PERDEDOR' | 'BREAK_EVEN' | 'ALL'
    symbols?: string[]
    dateRange?: { start: string; end: string }
    searchQuery?: string
}

/**
 * Aggregated statistics for selected trades in comparison view
 */
export interface ComparisonStats {
    selectedCount: number
    totalPnL: number
    avgPnL: number
    winRate: number
    avgRR: number
    avgDuration: number
    bestTrade: Trade
    worstTrade: Trade
}

/**
 * Selection state for keyboard navigation
 */
export interface SelectionState {
    selectedIds: Set<number>
    currentIndex: number
    maxSelections: number
}
