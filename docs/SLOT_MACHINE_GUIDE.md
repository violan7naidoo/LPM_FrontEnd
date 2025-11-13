# Slot Machine Component Guide

## Overview
The `SlotMachine` component is the core game logic component that handles reel spinning, win detection, animations, and communication with the backend API.

## Component Location
`src/components/game/slot-machine.tsx`

## Props Interface

```typescript
interface SlotMachineProps {
  betAmount: number;              // Current bet amount (e.g., 1.00, 2.00, 3.00, 5.00)
  setBetAmount: (amount: number) => void;  // Function to update bet amount
  betPerPayline: number;          // Calculated bet per payline (betAmount / 5)
}
```

## Key Responsibilities

### 1. State Management
- **Grid State**: Current symbol grid (5 reels × 3 rows)
- **Spinning State**: Which reels are currently spinning
- **Win State**: Winning lines, win amounts, animations
- **Balance**: Player balance
- **Free Spins**: Remaining free spins count
- **Action Games**: Action game spins remaining
- **Feature Symbol**: Selected expanding symbol for free spins
- **Autoplay**: Autoplay state and settings
- **Audio**: Music/SFX enabled state and volume

### 2. Bet Management
- **Circular Navigation**: Bet amounts cycle through [1, 2, 3, 5]
  - Increase: 1 → 2 → 3 → 5 → 1 (wraps)
  - Decrease: 1 → 5 → 3 → 2 → 1 (wraps)
- **Validation**: Checks balance before allowing spins
- **Display**: Shows current bet in control panel

### 3. Spin Logic
- **API Communication**: Sends spin request to backend
- **Reel Animation**: Manages spinning animation for each reel
- **Stopping Sequence**: Stops reels sequentially with bounce effect
- **Result Processing**: Processes backend response and updates grid
- **Win Detection**: Identifies winning paylines and calculates payouts

### 4. Feature Games
- **Free Spins**: 
  - Triggered by 3+ scatter symbols
  - Shows feature symbol selection animation
  - Expands selected symbol during free spins
  - Manages free spins countdown
- **Action Games**:
  - Triggered by 5 matching symbols (configurable)
  - Awards action game spins
  - Shows action game wheel (future)

### 5. Animations
- **Reel Spinning**: Continuous scroll animation
- **Reel Stopping**: Bounce effect when reel stops
- **Win Highlighting**: Colored borders on winning symbols
- **Expanding Reels**: Scale animation for expanded symbols
- **Win Celebration**: Coin confetti and count-up animation

### 6. Sound Management
- **Background Music**: Loops continuously (if enabled)
- **Spin Sound**: Loops while reels are spinning
- **Reel Stop**: Plays once per reel stop
- **Win Sounds**: Different sounds for regular vs big wins
- **Feature Sounds**: Special sounds for free spins trigger
- **Volume Control**: Adjustable volume (0-100)

## Component Structure

```
SlotMachine
├── ReelGrid
│   ├── PaylineNumbers (left/right indicators)
│   ├── ReelColumn × 5
│   │   └── SymbolDisplay × 3 (per reel)
│   └── WinningLinesDisplay (SVG overlay)
├── ControlPanel
│   ├── Bet Controls
│   ├── Spin Button
│   ├── Info Buttons
│   └── Audio Controls
├── WinAnimation (overlay)
├── FeatureSymbolSelection (modal)
└── Dialogs
    ├── AutoplayDialog
    ├── InfoDialog
    ├── PayTableDialog
    └── AudioSettingsDialog
```

## Data Flow

### Spin Flow
```
User clicks SPIN
  ↓
handleSpin() called
  ↓
Check balance & validation
  ↓
Set spinning state (all reels)
  ↓
Play spin sound
  ↓
Call gameApi.playGame()
  ↓
Backend processes spin
  ↓
Receive SpinResult
  ↓
Update grid with results
  ↓
Stop reels sequentially
  ↓
Detect winning lines
  ↓
Show win animations
  ↓
Update balance
```

### Bet Change Flow
```
User clicks +/- button
  ↓
handleIncreaseBet() / handleDecreaseBet()
  ↓
Find current bet in betAmounts array
  ↓
Calculate next/previous index (circular)
  ↓
setBetAmount(newAmount)
  ↓
betAmount prop updates
  ↓
MiddleSection updates payouts
  ↓
ControlPanel updates display
```

## Key Functions

### `handleSpin()`
Main spin handler function.

**Process:**
1. Validates balance and spin state
2. Deducts bet from balance
3. Sets all reels to spinning
4. Plays spin sound
5. Calls backend API
6. Processes response
7. Updates grid and state
8. Stops reels with animation
9. Shows win animations if applicable

### `handleIncreaseBet()` / `handleDecreaseBet()`
Bet amount navigation with circular logic.

**Circular Logic:**
- Current: 1.00 → Next: 2.00
- Current: 2.00 → Next: 3.00
- Current: 3.00 → Next: 5.00
- Current: 5.00 → Next: 1.00 (wraps)

### `processSpinResult()`
Processes backend response and updates game state.

**Handles:**
- Grid update with final symbols
- Winning line detection
- Free spins trigger
- Action game trigger
- Expanded symbols (feature game)
- Balance update
- Win amount calculation

## State Variables

### Core Game State
- `grid`: `SymbolId[][]` - Current symbol grid
- `spinningReels`: `boolean[]` - Which reels are spinning
- `balance`: `number` - Player balance
- `lastWin`: `number` - Last win amount
- `winningLines`: `WinningLine[]` - Current winning paylines

### Feature Game State
- `freeSpinsRemaining`: `number` - Free spins countdown
- `actionGameSpins`: `number` - Action game spins remaining
- `featureSymbol`: `string` - Selected expanding symbol
- `sessionId`: `string` - Backend session identifier

### Animation State
- `bouncingReels`: `boolean[]` - Reels currently bouncing
- `expandingReels`: `boolean[]` - Reels currently expanding
- `reelsToExpand`: `number[]` - Which reels should expand
- `winningFeedback`: `object` - Win animation data

### Settings State
- `isTurboMode`: `boolean` - Faster animations
- `isMusicEnabled`: `boolean` - Background music toggle
- `isSfxEnabled`: `boolean` - Sound effects toggle
- `volume`: `number` - Volume level (0-100)

### Autoplay State
- `autoplayState`: `object` - Autoplay configuration and status
  - `isActive`: Whether autoplay is running
  - `settings`: Autoplay configuration
  - `spinsRemaining`: Spins left in autoplay
  - `totalLoss`: Total loss during autoplay
  - `originalBalance`: Balance at autoplay start

## Configuration Hooks

The component uses several hooks to access configuration:

- `useNumReels()`: Number of reels (5)
- `useNumRows()`: Number of rows (3)
- `useBetAmounts()`: Available bet amounts
- `usePaylines()`: Payline definitions
- `useReelStrips()`: Reel strip configurations
- `useGameConfig()`: Full game configuration

## API Integration

### Endpoints Used
- `POST /play`: Main spin endpoint
- `POST /action-game/spin`: Action game wheel spin
- `GET /session/{sessionId}`: Get session state
- `POST /session/{sessionId}/reset`: Reset session

### Request Format
```typescript
{
  sessionId: string;
  betAmount: number;
  numPaylines: number;
  betPerPayline: number;
  actionGameSpins?: number;
  gameId: string;
}
```

### Response Format
```typescript
{
  sessionId: string;
  player: {
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
```

## Animation Details

### Reel Spinning
- **Duration**: 3 seconds (configurable)
- **Animation**: CSS `animate-reel-spin`
- **Sound**: Looping spin sound
- **Stopping**: Sequential with bounce effect

### Reel Stopping
- **Bounce Effect**: 300ms bounce animation (non-turbo)
- **Sound**: Reel stop sound per reel
- **Timing**: Staggered stops (reel 0 → reel 4)

### Win Highlighting
- **Border Colors**: Payline-specific colors
- **Glow Effect**: Colored shadow on winning symbols
- **Animation**: Pulse animation (if no sequence available)

### Expanding Reels
- **Trigger**: Feature game (free spins)
- **Animation**: Scale transform
- **Border**: Yellow border on all symbols in expanded reel
- **Duration**: Configurable

## Turbo Mode

When turbo mode is enabled:
- Faster reel spinning (reduced duration)
- No bounce animation on reel stop
- All other mechanics remain the same

## Autoplay System

### Configuration
- **Number of Spins**: 1-1000
- **Stop Conditions**:
  - Stop on any win
  - Stop if single win exceeds amount
  - Stop on feature (free spins)
  - Stop if total loss exceeds amount

### Execution
- Automatically triggers spins
- Checks stop conditions after each spin
- Updates balance and state
- Shows win animations
- Handles feature games

## Error Handling

- **API Errors**: Caught and displayed via toast notifications
- **Balance Insufficient**: Disables spin button
- **Config Missing**: Shows loading state
- **Network Errors**: Retry logic (future)

## Performance Considerations

- **Memoization**: Uses `useMemo` for expensive calculations
- **Animation Optimization**: Uses `requestAnimationFrame`
- **State Updates**: Batched where possible
- **Image Loading**: Next.js Image optimization
- **Sound Management**: Lazy loading of sound files

## Common Patterns

### Checking if Spinning
```typescript
const isSpinning = spinningReels.some(s => s);
```

### Calculating Total Bet
```typescript
const totalBet = betAmount; // Total bet = bet amount (not per payline)
```

### Formatting Bet Key
```typescript
const betKey = betAmount.toFixed(2); // "1.00", "2.00", etc.
```

### Accessing Symbol Config
```typescript
const symbol = config?.symbols?.[symbolId];
const payout = symbol?.payout?.[betKey]?.[count];
```

## Troubleshooting

### Reels Not Spinning
- Check `spinningReels` state
- Verify `isSpinning` calculation
- Check CSS animation classes

### Wins Not Displaying
- Verify `winningLines` state
- Check payline definitions
- Ensure `WinningLinesDisplay` is rendered

### Balance Not Updating
- Check API response structure
- Verify `balance` state updates
- Check for error messages

### Sounds Not Playing
- Check `isSfxEnabled` / `isMusicEnabled`
- Verify volume level
- Check sound file paths
- Ensure `use-sound` hook is working

## Future Enhancements

1. **Action Game Wheel**: Visual wheel component
2. **Progressive Jackpot**: Jackpot display and logic
3. **Gamification**: Achievements, levels, etc.
4. **Multiplayer**: Social features
5. **Tournaments**: Competitive gameplay

