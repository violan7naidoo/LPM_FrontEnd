// Direct Backend API Service for Frontend (no RGS layer)
const BACKEND_BASE_URL = 'http://localhost:5001';
const DEFAULT_GAME_ID = 'BOOK_OF_RA';

// Get GAME_ID from environment or default
function getGameId(): string {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const gameIdParam = urlParams.get('gameId');
    if (gameIdParam) return gameIdParam;
  }
  return process.env.NEXT_PUBLIC_GAME_ID || DEFAULT_GAME_ID;
}

export interface PlayRequest {
  sessionId: string;
  betAmount: number;
  numPaylines?: number;
  betPerPayline?: number;
  actionGameSpins?: number;
  gameId?: string;
  lastResponse?: any;
}

export interface PlayResponse {
  sessionId: string;
  player: {
    balance: number;
    freeSpinsRemaining: number;
    lastWin: number;
    results: SpinResult;
    actionGameSpins: number;
    featureSymbol: string;
  };
  game: {
    balance: number;
    freeSpinsRemaining: number;
    lastWin: number;
    results: SpinResult;
    actionGameSpins: number;
    featureSymbol: string;
  };
  freeSpins: number;
  actionGameSpins: number;
  featureSymbol: string;
}

export interface SpinResult {
  totalWin: number;
  winningLines: Array<{
    paylineIndex: number;
    symbol: string;
    count: number;
    payout: number;
    line: number[];
  }>;
  scatterWin: {
    count: number;
    triggeredFreeSpins: boolean;
  };
  grid: string[][];
  actionGameTriggered: boolean;
  actionGameSpins: number;
  actionGameWin: number;
  featureSymbol: string;
  expandedSymbols: Array<{
    reel: number;
    row: number;
  }>;
  expandedWin: number;
  featureGameWinningLines?: Array<{
    paylineIndex: number;
    symbol: string;
    count: number;
    payout: number;
    line: number[];
  }>;
}

export interface ActionGameSpinRequest {
  sessionId: string;
}

export interface ActionGameSpinResponse {
  sessionId: string;
  result: {
    win: number;
    additionalSpins: number;
    wheelResult: string;
  };
  remainingSpins: number;
}

export interface SessionResponse {
  sessionId: string;
  player: {
    balance: number;
    freeSpinsRemaining: number;
    lastWin: number;
    results: SpinResult;
    actionGameSpins: number;
    featureSymbol: string;
  };
  game: {
    balance: number;
    freeSpinsRemaining: number;
    lastWin: number;
    results: SpinResult;
    actionGameSpins: number;
    featureSymbol: string;
  };
  freeSpins: number;
  actionGameSpins: number;
  featureSymbol: string;
}

class GameApiService {
  private async makeRequest<T>(endpoint: string, method: 'GET' | 'POST', body?: any): Promise<T> {
    const url = `${BACKEND_BASE_URL}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body && method === 'POST') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async playGame(request: PlayRequest): Promise<PlayResponse> {
    const gameIdToUse = request.gameId || getGameId();
    return this.makeRequest<PlayResponse>(
      '/play',
      'POST',
      {
        ...request,
        gameId: gameIdToUse,
      }
    );
  }

  async spinActionGame(request: ActionGameSpinRequest): Promise<ActionGameSpinResponse> {
    return this.makeRequest<ActionGameSpinResponse>(
      '/action-game/spin',
      'POST',
      request
    );
  }

  async getSession(sessionId: string): Promise<SessionResponse> {
    return this.makeRequest<SessionResponse>(
      `/session/${sessionId}`,
      'GET'
    );
  }

  async resetSession(sessionId: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(
      `/session/${sessionId}/reset`,
      'POST'
    );
  }
}

export const gameApi = new GameApiService();

