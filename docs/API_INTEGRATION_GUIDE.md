# API Integration Guide

## Overview
This guide covers the backend API integration, including request/response formats, error handling, and session management.

## API Service Location
`src/lib/game-api.ts`

## Base Configuration

### Base URL
```typescript
const BACKEND_BASE_URL = 'http://localhost:5001';
```

### Game ID Resolution
Priority order:
1. URL query parameter (`?gameId=...`)
2. Environment variable (`NEXT_PUBLIC_GAME_ID`)
3. Default value (`'SNOW_KINGDOM'`)

## API Endpoints

### 1. Play Game (Spin)
**Endpoint**: `POST /play`

**Request:**
```typescript
interface PlayRequest {
  sessionId: string;           // Current session ID
  betAmount: number;           // Total bet amount (e.g., 2.00)
  numPaylines?: number;        // Number of paylines (default: 5)
  betPerPayline?: number;      // Bet per payline (optional)
  actionGameSpins?: number;    // Remaining action game spins
  gameId?: string;            // Game ID (optional)
  lastResponse?: any;         // Last response (for retries)
}
```

**Response:**
```typescript
interface PlayResponse {
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
    // Same structure as player
  };
  freeSpins: number;
  actionGameSpins: number;
  featureSymbol: string;
}
```

**SpinResult Structure:**
```typescript
interface SpinResult {
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
  grid: string[][];              // Final symbol grid
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
```

### 2. Action Game Spin
**Endpoint**: `POST /action-game/spin`

**Request:**
```typescript
interface ActionGameSpinRequest {
  sessionId: string;
}
```

**Response:**
```typescript
interface ActionGameSpinResponse {
  sessionId: string;
  result: {
    win: number;
    additionalSpins: number;
    wheelResult: string;
  };
  remainingSpins: number;
}
```

### 3. Get Session
**Endpoint**: `GET /session/{sessionId}`

**Response:**
```typescript
interface SessionResponse {
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
    // Same structure as player
  };
  freeSpins: number;
  actionGameSpins: number;
  featureSymbol: string;
}
```

### 4. Reset Session
**Endpoint**: `POST /session/{sessionId}/reset`

**Response:**
```typescript
{
  message: string;
}
```

## Usage Examples

### Basic Spin
```typescript
import { gameApi } from '@/lib/game-api';

const response = await gameApi.playGame({
  sessionId: 'session-123',
  betAmount: 2.00,
  numPaylines: 5,
  betPerPayline: 0.40
});

// Access results
const grid = response.player.results.grid;
const totalWin = response.player.results.totalWin;
const winningLines = response.player.results.winningLines;
const balance = response.player.balance;
```

### Action Game Spin
```typescript
const response = await gameApi.spinActionGame({
  sessionId: 'session-123'
});

const win = response.result.win;
const additionalSpins = response.result.additionalSpins;
const remainingSpins = response.remainingSpins;
```

### Get Session State
```typescript
const session = await gameApi.getSession('session-123');
const balance = session.player.balance;
const freeSpins = session.player.freeSpinsRemaining;
```

### Reset Session
```typescript
await gameApi.resetSession('session-123');
// Session reset to initial state
```

## Error Handling

### Error Types
1. **Network Errors**: Connection failures, timeouts
2. **HTTP Errors**: 4xx, 5xx status codes
3. **Validation Errors**: Invalid request data
4. **Game Errors**: Insufficient balance, invalid state

### Error Response Format
```typescript
{
  message: string;        // Error message
  detail?: string;        // Additional details
  status?: number;        // HTTP status code
}
```

### Error Handling Pattern
```typescript
try {
  const response = await gameApi.playGame(request);
  // Process successful response
} catch (error) {
  if (error instanceof Error) {
    // Display error message
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    });
  }
}
```

## Session Management

### Session ID
- Generated on first spin
- Stored in component state
- Passed with every request
- Used for state persistence

### Session Lifecycle
1. **Initialization**: First spin creates session
2. **Active**: Session maintained across spins
3. **Reset**: Can be reset to initial state
4. **Persistence**: Backend maintains session state

## Request Flow

### Spin Request Flow
```
User clicks SPIN
  ↓
Validate balance and state
  ↓
Prepare PlayRequest object
  ↓
Call gameApi.playGame(request)
  ↓
Backend processes spin
  ↓
Calculate results
  ↓
Return PlayResponse
  ↓
Update frontend state
  ↓
Display results and animations
```

## Response Processing

### Grid Update
```typescript
const grid = response.player.results.grid;
// grid is string[][] (5 reels × 3 rows)
setGrid(grid);
```

### Winning Lines
```typescript
const winningLines = response.player.results.winningLines;
// Array of winning payline objects
setWinningLines(winningLines);
```

### Balance Update
```typescript
const balance = response.player.balance;
setBalance(balance);
```

### Free Spins
```typescript
const freeSpins = response.player.freeSpinsRemaining;
if (freeSpins > 0) {
  setFreeSpinsRemaining(freeSpins);
  // Trigger feature symbol selection
}
```

### Action Games
```typescript
const actionSpins = response.player.actionGameSpins;
if (actionSpins > 0) {
  setActionGameSpins(actionSpins);
  // Show action game wheel
}
```

## Data Validation

### Request Validation
- **sessionId**: Must be non-empty string
- **betAmount**: Must be positive number
- **numPaylines**: Must be 1-5 (typically 5)
- **betPerPayline**: Must match betAmount / numPaylines

### Response Validation
- **grid**: Must be 5×3 array of valid symbol IDs
- **winningLines**: Must be array of valid WinningLine objects
- **balance**: Must be non-negative number
- **totalWin**: Must be non-negative number

## Retry Logic

### Automatic Retries (Future)
- Network errors: Retry up to 3 times
- 5xx errors: Retry with exponential backoff
- 4xx errors: Don't retry (client error)

### Manual Retries
```typescript
try {
  const response = await gameApi.playGame(request);
} catch (error) {
  // User can manually retry
  if (userWantsRetry) {
    const response = await gameApi.playGame({
      ...request,
      lastResponse: previousResponse
    });
  }
}
```

## Best Practices

1. **Always handle errors** with try-catch
2. **Validate responses** before using data
3. **Update state atomically** after successful response
4. **Show loading states** during API calls
5. **Provide user feedback** for errors
6. **Log errors** for debugging
7. **Handle network failures** gracefully

## Testing

### Mock API Responses
```typescript
// For testing without backend
const mockResponse: PlayResponse = {
  sessionId: 'test-session',
  player: {
    balance: 1000,
    freeSpinsRemaining: 0,
    lastWin: 0,
    results: {
      totalWin: 70,
      winningLines: [...],
      scatterWin: { count: 0, triggeredFreeSpins: false },
      grid: [['Queen', 'Stone', ...], ...]
    },
    actionGameSpins: 0,
    featureSymbol: ''
  },
  // ... rest of response
};
```

### Error Scenarios
- Network timeout
- Invalid session ID
- Insufficient balance
- Invalid bet amount
- Server errors (500)

## Security Considerations

1. **Session Validation**: Backend validates session IDs
2. **Bet Validation**: Backend validates bet amounts
3. **State Verification**: Backend maintains authoritative state
4. **No Client-Side Logic**: All game logic on backend
5. **HTTPS**: Use HTTPS in production

## Performance

### Optimization
- **Request Batching**: Batch multiple requests when possible
- **Response Caching**: Cache session state locally
- **Lazy Loading**: Load data only when needed
- **Error Recovery**: Quick recovery from errors

### Monitoring
- Track API response times
- Monitor error rates
- Log slow requests
- Alert on failures

