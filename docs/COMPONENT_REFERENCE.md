# Component Reference Guide

## Game Components

### TopSection.tsx
**Purpose**: Displays the top section of the game (currently placeholder for Action Games Wheel)

**Props**: None

**Features**:
- Takes `flex-[1.5]` of vertical space
- Placeholder for future Action Games Wheel component

---

### MiddleSection.tsx ⭐
**Purpose**: Dynamic paytable display

**Props**:
- `betAmount: number` - Current bet amount

**Key Features**:
- 4x2 grid layout
- Dynamic payout updates based on bet
- Action games display
- Central feature overlay

**See**: [MIDDLE_SECTION_GUIDE.md](./MIDDLE_SECTION_GUIDE.md) for detailed documentation

---

### BottomSection.tsx
**Purpose**: Container for slot machine and controls

**Props**:
- `betAmount: number`
- `setBetAmount: (amount: number) => void`
- `betPerPayline: number`

**Features**:
- Takes `flex-[3]` of vertical space (largest section)
- Contains SlotMachine component

---

### slot-machine.tsx
**Purpose**: Main game logic and reel spinning

**Props**:
- `betAmount: number`
- `setBetAmount: (amount: number) => void`
- `betPerPayline: number`

**Key Features**:
- Manages spin state
- Handles bet controls (circular increment/decrement)
- Communicates with backend API
- Displays win animations
- Manages feature games

**State Management**:
- Spin state (idle, spinning, results)
- Win state
- Feature game state
- Autoplay state

---

### reel-column.tsx
**Purpose**: Individual reel column component

**Props**:
- `reelIndex: number`
- `symbols: string[]`
- `isSpinning: boolean`
- `spinResult?: string[]`

**Features**:
- Displays symbols in vertical column
- Handles spinning animation
- Shows final result symbols

---

### symbol-display.tsx
**Purpose**: Renders individual symbol images

**Props**:
- `symbolId: string`
- `width: number`
- `height: number`
- `className?: string`

**Features**:
- Optimized image loading with Next.js Image
- Handles missing symbols gracefully

---

### control-panel.tsx
**Purpose**: Bet controls and spin button

**Props**:
- `betPerPayline: number`
- `numPaylines: number`
- `totalBet: number`
- `onIncreaseBet: () => void`
- `onDecreaseBet: () => void`
- `onSpin: () => void`
- `isSpinning: boolean`
- `canSpin: boolean`

**Features**:
- Bet increase/decrease buttons
- Spin button with glow effect
- Bet amount display
- Payline information

---

### payline-numbers.tsx
**Purpose**: Displays payline indicators on sides of reel grid

**Props**:
- `numPaylines: number`

**Features**:
- Shows payline numbers (1-5)
- Positioned absolutely on left/right sides
- Responsive sizing

---

### winning-lines-display.tsx
**Purpose**: Overlays winning line indicators

**Props**:
- `winningLines: WinningLine[]`
- `numReels: number`
- `numRows: number`

**Features**:
- Highlights winning paylines
- Shows win amounts
- Animation effects

---

### win-animation.tsx
**Purpose**: Win celebration animations

**Props**:
- `winAmount: number`
- `isVisible: boolean`
- `onComplete: () => void`

**Features**:
- Confetti effects
- Win amount display
- Sound effects

---

## Dialog Components

### info-dialog.tsx
**Purpose**: Game information modal

**Features**:
- Game rules
- Paytable information
- Feature explanations

---

### pay-table-dialog.tsx
**Purpose**: Detailed paytable modal

**Props**:
- `betPerPayline: number`
- `totalBet: number`

**Features**:
- Complete paytable display
- Bet-specific payouts
- Action games information

---

### autoplay-dialog.tsx
**Purpose**: Autoplay settings

**Props**:
- `isOpen: boolean`
- `onClose: () => void`
- `onStart: (settings: AutoplaySettings) => void`

**Features**:
- Number of spins selection
- Stop conditions
- Bet settings

---

### audio-settings-dialog.tsx
**Purpose**: Audio settings

**Props**:
- `isOpen: boolean`
- `onClose: () => void`
- `volume: number`
- `onVolumeChange: (volume: number) => void`

**Features**:
- Volume control
- Sound effects toggle
- Music toggle

---

## Utility Components

### feature-symbol-selection.tsx
**Purpose**: Feature game symbol picker

**Props**:
- `symbols: string[]`
- `onSelect: (symbol: string) => void`

**Features**:
- Symbol selection interface
- Visual feedback

---

### image-sequence-animation.tsx
**Purpose**: Image sequence animations

**Props**:
- `images: string[]`
- `duration: number`
- `onComplete: () => void`

**Features**:
- Frame-by-frame animation
- Timing control
- Completion callback

---

## Hooks

### use-game-config.tsx
**Purpose**: Provides game configuration context

**Returns**:
```typescript
{
  config: FrontendGameConfig | null;
  loading: boolean;
  error: string | null;
  gameId: string;
}
```

**Usage**:
```typescript
const { config, loading, error } = useGameConfig();
```

**Features**:
- Loads config from `/public/config/{gameId}.json`
- Provides context to all components
- Handles loading/error states

---

## Library Files

### game-api.ts
**Purpose**: Backend API communication

**Functions**:
- `playGame()`: Sends spin request to backend
- `getGameConfig()`: Fetches game configuration

**Base URL**: `http://localhost:5001`

---

### game-config-types.ts
**Purpose**: TypeScript type definitions

**Types**:
- `FrontendGameConfig`: Main game config structure
- `FrontendSymbolConfig`: Symbol configuration
- `ActionGameTrigger`: Action game trigger definition

---

### slot-config.ts
**Purpose**: Slot machine configuration helpers

**Functions**:
- `useBetAmounts()`: Returns available bet amounts
- Configuration constants

---

### sounds.ts
**Purpose**: Audio/sound management

**Functions**:
- `playSpinSound()`
- `playWinSound()`
- `playClickSound()`
- Volume management

---

## Styling

### globals.css
**Purpose**: Global styles and game container

**Key Classes**:
- `.game-container`: Main game wrapper (1296px × 2550px)
- `.control-panel-card`: Control panel styling
- `.spin-button-glow`: Spin button glow effect
- `.gold-text-glow`: Gold text glow effect

---

## Data Flow Summary

```
page.tsx
  ├─ betAmount state
  ├─ TopSection
  ├─ MiddleSection (betAmount)
  │   └─ useGameConfig() → config
  │       └─ PayCell/LowPayCell (betKey, config)
  │
  └─ BottomSection (betAmount, setBetAmount)
      └─ SlotMachine
          ├─ useGameConfig() → config
          ├─ ReelColumn (x5)
          ├─ ControlPanel
          └─ Dialogs
```

---

## Component Communication

### Props Down
- `betAmount` flows from `page.tsx` → `MiddleSection` → `PayCell`
- `config` flows from `useGameConfig()` → all components

### Events Up
- `setBetAmount` flows from `page.tsx` → `BottomSection` → `SlotMachine` → `ControlPanel`
- Spin events flow from `ControlPanel` → `SlotMachine` → `game-api.ts`

### Context
- `GameConfigContext` provides config to all components
- Accessed via `useGameConfig()` hook

---

## Best Practices

1. **Always check for config**: Use `if (!config) return null` before accessing config data
2. **Format bet keys**: Always use `betAmount.toFixed(2)` to match config keys
3. **Handle missing data**: Use optional chaining (`?.`) and fallbacks (`|| {}`)
4. **Type safety**: Use TypeScript types from `game-config-types.ts`
5. **Client components**: Mark all game components with `'use client'`

