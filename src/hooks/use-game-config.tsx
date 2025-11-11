'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { FrontendGameConfig, FrontendSymbolConfig } from '@/lib/game-config-types';

interface GameConfigContextType {
  config: FrontendGameConfig | null;
  loading: boolean;
  error: string | null;
  gameId: string;
}

const GameConfigContext = createContext<GameConfigContextType | undefined>(undefined);

// Get gameId from environment variable or default
function getGameId(): string {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const gameIdParam = urlParams.get('gameId');
    if (gameIdParam) return gameIdParam;
  }
  
  return process.env.NEXT_PUBLIC_GAME_ID || 'BOOK_OF_RA';
}

export function GameConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<FrontendGameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameId] = useState(getGameId());

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        setError(null);
        
        // Load config from public/config/{gameId}.json
        const response = await fetch(`/config/${gameId}.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to load game config for: ${gameId}`);
        }
        
        const loadedConfig: FrontendGameConfig = await response.json();
        
        // Validate required fields
        if (!loadedConfig.numReels || !loadedConfig.numRows || !loadedConfig.symbols || !loadedConfig.paylines) {
          throw new Error('Invalid game configuration: missing required fields');
        }
        
        setConfig(loadedConfig);
      } catch (err) {
        console.error('Error loading game config:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [gameId]);

  return (
    <GameConfigContext.Provider value={{ config, loading, error, gameId }}>
      {children}
    </GameConfigContext.Provider>
  );
}

export function useGameConfig() {
  const context = useContext(GameConfigContext);
  if (context === undefined) {
    throw new Error('useGameConfig must be used within a GameConfigProvider');
  }
  return context;
}

// Helper functions
export function getSymbolIds(config: FrontendGameConfig): string[] {
  return Object.keys(config.symbols);
}

export function getSymbolConfig(config: FrontendGameConfig, symbolId: string): FrontendSymbolConfig | undefined {
  return config.symbols[symbolId];
}

