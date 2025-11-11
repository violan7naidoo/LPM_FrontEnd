// Symbols configuration - now loaded from config
export type SymbolId = string; // Dynamic based on config

// Hook to get symbols from config
import { useGameConfig } from '@/hooks/use-game-config';
import type { FrontendSymbolConfig } from '@/lib/game-config-types';

export function useSymbols(): Record<string, FrontendSymbolConfig> {
  const { config } = useGameConfig();
  if (!config) return {};
  
  // Convert config symbols to the expected format
  const symbols: Record<string, FrontendSymbolConfig> = {};
  Object.keys(config.symbols).forEach((key) => {
    symbols[key] = config.symbols[key];
  });
  
  return symbols;
}

