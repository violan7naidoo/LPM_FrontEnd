# State Management Guide

## Overview
This guide explains the state management architecture of the slot game frontend, including state flow, lifting, and component communication.

## State Architecture

### State Hierarchy
```
page.tsx (Root State)
  ├── betAmount (lifted state)
  └── betPerPayline (calculated)
      ↓
  ├── MiddleSection (receives betAmount)
  └── BottomSection (receives betAmount, setBetAmount)
      └── SlotMachine (receives betAmount, setBetAmount)
          ├── grid (local state)
          ├── spinningReels (local state)
          ├── balance (local state)
          ├── winningLines (local state)
          └── ... (many local states)
```

### Context-Based State
```
GameConfigProvider (Context)
  └── config (global state)
      ↓
  All components via useGameConfig()
```

## State Types

### 1. Lifted State (page.tsx)
**Purpose**: Shared between multiple components

**State:**
- `betAmount`: Current bet amount
- `setBetAmount`: Function to update bet

**Shared With:**
- `MiddleSection`: Displays payouts for current bet
- `BottomSection` → `SlotMachine`: Bet controls

### 2. Local Component State
**Purpose**: Component-specific state

**Examples:**
- `grid`: Symbol grid in SlotMachine
- `spinningReels`: Which reels are spinning
- `balance`: Player balance
- `winningLines`: Current winning paylines

### 3. Context State
**Purpose**: Global application state

**State:**
- `config`: Game configuration
- `loading`: Config loading status
- `error`: Config loading errors

**Access:**
- Via `useGameConfig()` hook
- Available to all components

## State Flow Patterns

### Props Down, Events Up
```
Parent Component
  ├── State: betAmount
  ├── Pass down: betAmount prop
  └── Receive up: setBetAmount callback
      ↓
Child Component
  ├── Receives: betAmount prop
  ├── Calls: setBetAmount(newValue)
  └── Parent updates state
```

### Context Pattern
```
GameConfigProvider
  ├── Loads config
  ├── Stores in Context
  └── Provides to all components
      ↓
Any Component
  ├── Calls: useGameConfig()
  └── Receives: { config, loading, error }
```

## Key State Variables

### SlotMachine State

#### Game State
```typescript
const [grid, setGrid] = useState<SymbolId[][]>([]);
const [spinningReels, setSpinningReels] = useState<boolean[]>([]);
const [balance, setBalance] = useState(500);
const [lastWin, setLastWin] = useState(0);
const [winningLines, setWinningLines] = useState<WinningLine[]>([]);
```

#### Feature Game State
```typescript
const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);
const [actionGameSpins, setActionGameSpins] = useState(0);
const [featureSymbol, setFeatureSymbol] = useState<string>('');
```

#### Animation State
```typescript
const [bouncingReels, setBouncingReels] = useState<boolean[]>([]);
const [expandingReels, setExpandingReels] = useState<boolean[]>([]);
const [reelsToExpand, setReelsToExpand] = useState<number[]>([]);
```

#### Settings State
```typescript
const [isTurboMode, setIsTurboMode] = useState(false);
const [isMusicEnabled, setIsMusicEnabled] = useState(true);
const [isSfxEnabled, setIsSfxEnabled] = useState(true);
const [volume, setVolume] = useState(50);
```

#### Autoplay State
```typescript
const [autoplayState, setAutoplayState] = useState<AutoplayState>({
  isActive: false,
  settings: null,
  spinsRemaining: 0,
  totalLoss: 0,
  originalBalance: 0
});
```

## State Updates

### Synchronous Updates
```typescript
// Direct state update
setBalance(newBalance);
setLastWin(winAmount);
```

### Async Updates (API Calls)
```typescript
const response = await gameApi.playGame(request);
setBalance(response.player.balance);
setGrid(response.player.results.grid);
setWinningLines(response.player.results.winningLines);
```

### Batched Updates
```typescript
// React batches these automatically
setGrid(newGrid);
setWinningLines(newWinningLines);
setBalance(newBalance);
```

## State Derivation

### Computed Values
```typescript
// Derived from state, not stored
const isSpinning = spinningReels.some(s => s);
const totalBet = betAmount; // Not per payline
const canSpin = balance >= totalBet && !isSpinning;
```

### Memoized Values
```typescript
const spinButtonText = useMemo(() => {
  if (isSpinning) return 'SPINNING';
  if (isFreeSpinsMode) return 'FREE SPIN';
  return 'SPIN';
}, [isSpinning, isFreeSpinsMode]);
```

## State Lifting

### Why Lift State?
- **Sharing**: Multiple components need same data
- **Synchronization**: Keep components in sync
- **Single Source of Truth**: One place for state

### Example: betAmount
**Before (Local):**
```typescript
// In slot-machine.tsx
const [betAmount, setBetAmount] = useState(1.00);
// Only available in SlotMachine
```

**After (Lifted):**
```typescript
// In page.tsx
const [betAmount, setBetAmount] = useState(1.00);
// Available to MiddleSection and BottomSection
```

## State Flow Examples

### Bet Change Flow
```
User clicks + button
  ↓
ControlPanel calls onIncreaseBet()
  ↓
SlotMachine handleIncreaseBet()
  ↓
Finds current bet in array
  ↓
Calculates next bet (circular)
  ↓
Calls setBetAmount(newBet)
  ↓
betAmount state updates in page.tsx
  ↓
Props update:
  - MiddleSection receives new betAmount
  - BottomSection receives new betAmount
  ↓
Components re-render:
  - MiddleSection updates payouts
  - ControlPanel updates display
```

### Spin Flow
```
User clicks SPIN
  ↓
SlotMachine handleSpin()
  ↓
Updates local state:
  - setSpinningReels([true, true, true, true, true])
  - setBalance(balance - totalBet)
  ↓
Calls API
  ↓
Receives response
  ↓
Updates state with results:
  - setGrid(response.grid)
  - setWinningLines(response.winningLines)
  - setBalance(response.balance)
  - setLastWin(response.totalWin)
  ↓
Stops reels sequentially
  ↓
Shows win animations
```

## Context State Management

### GameConfigProvider
```typescript
// Provides global config state
const [config, setConfig] = useState<FrontendGameConfig | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### Accessing Context
```typescript
// In any component
const { config, loading, error } = useGameConfig();
```

## State Persistence

### Session State
- **Backend**: Maintains session state
- **Frontend**: Syncs with backend on each spin
- **Persistence**: Backend handles persistence

### Local State
- **Temporary**: Lost on page refresh
- **Sync**: Synced with backend on spin
- **Initial**: Loaded from backend session

## State Validation

### Input Validation
```typescript
// Validate bet amount
if (betAmount < minBet || betAmount > maxBet) {
  // Handle error
}
```

### State Validation
```typescript
// Validate grid state
if (grid.length !== numReels) {
  // Handle error
}
```

## Performance Optimization

### Memoization
```typescript
// Memoize expensive calculations
const totalWin = useMemo(() => {
  return winningLines.reduce((sum, line) => sum + line.payout, 0);
}, [winningLines]);
```

### State Batching
```typescript
// React automatically batches state updates
setGrid(newGrid);
setWinningLines(newWinningLines);
// Both updates in single render
```

### Conditional Updates
```typescript
// Only update if changed
if (newBalance !== balance) {
  setBalance(newBalance);
}
```

## Common Patterns

### Derived State
```typescript
// Don't store, compute from other state
const isSpinning = spinningReels.some(s => s);
const canSpin = balance >= totalBet && !isSpinning;
```

### State Initialization
```typescript
// Initialize from config or default
const [betAmount, setBetAmount] = useState(
  betAmounts[0] || 1.00
);
```

### State Reset
```typescript
// Reset to initial state
setBalance(500);
setFreeSpinsRemaining(0);
setWinningLines([]);
```

## Best Practices

1. **Lift state only when needed** for sharing
2. **Keep state local** when possible
3. **Use context** for truly global state
4. **Memoize expensive calculations**
5. **Validate state updates**
6. **Batch related updates**
7. **Derive state** instead of storing duplicates
8. **Initialize with sensible defaults**

## Troubleshooting

### State Not Updating
- Check if state setter is called
- Verify state update is not conditional
- Check for stale closures

### Props Not Updating
- Verify parent state is updating
- Check prop passing chain
- Ensure setState is called

### Context Not Available
- Verify component is inside Provider
- Check hook is used correctly
- Ensure config is loaded

### State Out of Sync
- Check API response processing
- Verify state updates after API calls
- Ensure no race conditions

