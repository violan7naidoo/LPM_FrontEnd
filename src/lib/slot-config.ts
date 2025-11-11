// Slot configuration types and helpers
// All values are now loaded from config, not hardcoded

import { useGameConfig } from '@/hooks/use-game-config';
import type { SymbolId } from '@/lib/game-config-types';

export type { SymbolId };

export interface WinningLine {
  paylineIndex: number;
  symbol: SymbolId;
  count: number;
  payout: number;
  line: number[];
}

export interface SpinResult {
  totalWin: number;
  winningLines: WinningLine[];
  scatterWin: {
    count: number;
    triggeredFreeSpins: boolean;
  };
}

// Hook to get NUM_REELS from config
export function useNumReels(): number {
  const { config } = useGameConfig();
  return config?.numReels ?? 5;
}

// Hook to get NUM_ROWS from config
export function useNumRows(): number {
  const { config } = useGameConfig();
  return config?.numRows ?? 3;
}

// Hook to get PAYLINES from config
export function usePaylines(): number[][] {
  const { config } = useGameConfig();
  return config?.paylines ?? [];
}

// Hook to get BET_AMOUNTS from config
export function useBetAmounts(): number[] {
  const { config } = useGameConfig();
  return config?.betAmounts ?? [1, 2, 3, 5, 10];
}

// Hook to get FREE_SPINS_AWARDED from config
export function useFreeSpinsAwarded(): number {
  const { config } = useGameConfig();
  return config?.freeSpinsAwarded ?? 10;
}

// Hook to get WILD_SYMBOL from config (or bookSymbol for Book of Ra)
export function useWildSymbol(): SymbolId {
  const { config } = useGameConfig();
  if (!config) return 'Scatter' as SymbolId;
  // Check if using Book of Ra style (combined wild/scatter)
  if ('bookSymbol' in config && config.bookSymbol) {
    return config.bookSymbol as SymbolId;
  }
  return (config?.wildSymbol ?? 'Scatter') as SymbolId;
}

// Hook to get SCATTER_SYMBOL from config (or bookSymbol for Book of Ra)
export function useScatterSymbol(): SymbolId {
  const { config } = useGameConfig();
  if (!config) return 'Scatter' as SymbolId;
  // Check if using Book of Ra style (combined wild/scatter)
  if ('bookSymbol' in config && config.bookSymbol) {
    return config.bookSymbol as SymbolId;
  }
  return (config?.scatterSymbol ?? 'Scatter') as SymbolId;
}

// Hook to get REEL_STRIPS from config
export function useReelStrips(): SymbolId[][] {
  const { config } = useGameConfig();
  if (!config) return [];
  
  // Use reel strips from config if available
  if (config.reelStrips && config.reelStrips.length > 0) {
    return config.reelStrips as SymbolId[][];
  }
  
  // Generate a simple fallback reel strip with all symbols
  const symbolIds = Object.keys(config.symbols) as SymbolId[];
  return Array(config.numReels).fill(null).map(() => [...symbolIds]);
}

