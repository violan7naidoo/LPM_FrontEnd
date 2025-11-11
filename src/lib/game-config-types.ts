// Frontend Game Configuration Types
// Matches the structure of backend JSON configs

export interface FrontendGameConfig {
  gameId?: string;
  gameName: string;
  numReels: number;
  numRows: number;
  betAmounts: number[];
  freeSpinsAwarded: number;
  
  // Legacy fields (for backward compatibility)
  wildSymbol?: string;
  scatterSymbol?: string;
  
  // Book of Ra specific fields
  bookSymbol?: string; // Combined wild/scatter symbol
  maxPaylines?: number;
  actionGameTriggers?: Record<string, ActionGameTrigger>;
  actionGameWheel?: Record<string, number>;
  
  symbols: Record<string, FrontendSymbolConfig>;
  paylines: number[][];
  reelStrips?: string[][]; // Optional: reel strips for spinning animation
  scatterPayout?: Record<string, Record<string, number>>; // Bet-specific scatter payouts
  scatterActionGames?: Record<string, Record<string, number>>; // Bet-specific scatter action games
}

export interface FrontendSymbolConfig {
  name: string;
  image: string;
  // Bet-specific payouts: key is bet amount (e.g., "1.00"), value is count -> payout in Rands
  payout?: Record<string, Record<string, number>>; // e.g., {"1.00": {"3": 1.00, "4": 5.00}, "2.00": {...}}
  actionGames?: Record<string, Record<string, number>>; // Bet-specific action games
}

export interface ActionGameTrigger {
  symbol: string;
  count: number;
  baseWin: number;
  actionSpins: number;
}

export type SymbolId = string;

