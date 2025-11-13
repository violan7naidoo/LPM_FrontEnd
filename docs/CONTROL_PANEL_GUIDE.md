# Control Panel Component Guide

## Overview
The `ControlPanel` component is the main user interface for game controls. It displays game information, bet controls, spin button, and settings dialogs.

## Component Location
`src/components/game/control-panel.tsx`

## Props Interface

```typescript
interface ControlPanelProps {
  // Bet Information
  betPerPayline: number;
  numPaylines: number;
  totalBet: number;
  
  // Game State
  balance: number;
  lastWin: number;
  isSpinning: boolean;
  
  // Bet Controls
  onSpin: () => void;
  onIncreaseBet: () => void;
  onDecreaseBet: () => void;
  onIncreasePaylines: () => void;
  onDecreasePaylines: () => void;
  
  // Feature Game State
  freeSpinsRemaining: number;
  isFreeSpinsMode: boolean;
  actionGameSpins: number;
  featureSymbol?: string;
  
  // Settings
  isTurboMode: boolean;
  onToggleTurbo: () => void;
  isMusicEnabled: boolean;
  onToggleMusic: () => void;
  isSfxEnabled: boolean;
  onToggleSfx: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  maxPaylines: number;
  
  // Autoplay
  autoplayState?: {
    isActive: boolean;
    settings: any;
    spinsRemaining: number;
    totalLoss: number;
    originalBalance: number;
  };
  onStartAutoplay?: (settings: any) => void;
  onStopAutoplay?: () => void;
  onShowAutoplayDialog?: () => void;
}
```

## Layout Structure

### Desktop Layout (sm and above)
Single horizontal row with all controls:

```
[Balance] [Bet Controls] [Turbo] [SPIN] [Auto] [Win] [Info Buttons]
```

### Mobile Layout (xs)
Stacked vertical layout:

```
Row 1: [Turbo] [SPIN] [Auto]
Row 2: [Win] [Bet Controls]
Row 3: [Balance] [Info Buttons]
```

## Component Sections

### 1. Balance Display
- **Label**: "Balance"
- **Value**: Current player balance (formatted as currency)
- **Styling**: Cyan text with glow effect
- **Updates**: Real-time as balance changes

### 2. Bet Controls
- **Label**: "Bet"
- **Controls**: 
  - `-` button (decrease)
  - Bet amount display (R{totalBet})
  - `+` button (increase)
- **Behavior**: 
  - Circular navigation (1 → 2 → 3 → 5 → 1)
  - Disabled while spinning
  - Click sound on interaction

### 3. Spin Button
- **States**:
  - "SPIN": Normal base game
  - "SPINNING": Reels are spinning (with spinner icon)
  - "FREE SPIN": In free spins mode
  - "ACTION SPIN": In action game mode
- **Styling**: 
  - Large circular button
  - Spin icon image
  - Glow effect when enabled
  - Disabled state when can't spin
- **Behavior**:
  - Disabled when spinning
  - Disabled when balance insufficient (unless free/action spins)
  - Triggers `onSpin()` callback

### 4. Turbo Button
- **Purpose**: Toggle turbo mode (faster animations)
- **Styling**: Circular button with turbo icon
- **State**: Visual feedback when active (opacity change)
- **Behavior**: Toggles `isTurboMode` state

### 5. Auto Spin Button
- **Purpose**: Start/stop autoplay
- **Styling**: Circular button with auto icon
- **States**:
  - Inactive: Opens autoplay dialog
  - Active: Stops autoplay
- **Behavior**: 
  - Shows only if `autoplayState` is provided
  - Visual feedback when active

### 6. Win Display
- **Label**: "Win"
- **Value**: Last win amount (formatted as currency)
- **Styling**: Cyan text with glow effect
- **Updates**: After each spin result

### 7. Free Spins Display
- **Shown**: Only in free spins mode
- **Label**: "Free Spins"
- **Value**: Remaining free spins count
- **Styling**: Same as other info displays

### 8. Action Spins Display
- **Shown**: Only when `actionGameSpins > 0`
- **Label**: "Action Spins"
- **Value**: Remaining action game spins
- **Styling**: Same as other info displays

### 9. Feature Symbol Display
- **Shown**: Only in free spins mode with `featureSymbol`
- **Label**: "Expanding Symbol"
- **Content**: Symbol image (expanding symbol for free spins)
- **Styling**: Centered symbol image

### 10. Info Buttons
Three dialog buttons:
- **Pay Table**: Opens paytable dialog
- **Info**: Opens game rules dialog
- **Audio**: Opens audio settings dialog

## Helper Components

### InfoDisplay
Desktop version of information display.

**Props:**
- `label`: Display label
- `value`: Value to display
- `isCurrency`: Whether to format as currency (default: true)

**Styling:**
- Background: `info-display-bg` class
- Label: Subtle cyan text, uppercase, monospace
- Value: Large cyan text with glow effect

### MobileInfoDisplay
Mobile-optimized version with smaller text and full width.

**Props:** Same as InfoDisplay

**Styling:**
- Smaller text sizes
- Full width layout
- Reduced padding

## Spin Button States

### Button Text Logic
```typescript
if (isSpinning) return 'SPINNING';
if (isFreeSpinsMode) return 'FREE SPIN';
if (actionGameSpins > 0) return 'ACTION SPIN';
return 'SPIN';
```

### Button Disabled Logic
```typescript
const isButtonDisabled = 
  isSpinning || 
  (balance < totalBet && !isFreeSpinsMode && actionGameSpins === 0);
```

**Disabled when:**
- Reels are spinning, OR
- Balance insufficient AND not in free spins AND no action spins

## Responsive Design

### Breakpoints
- **xs**: Mobile (< 640px)
- **sm**: Tablet (≥ 640px)
- **md**: Desktop (≥ 768px)
- **lg**: Large desktop (≥ 1024px)

### Size Adjustments
- **Buttons**: Scale from 12px (mobile) to 28px (desktop)
- **Text**: Scale from 10px (mobile) to 2xl (desktop)
- **Icons**: Scale proportionally

## Styling Classes

### Custom Classes (from globals.css)
- `info-display-bg`: Background for info displays
- `cyan-text-glow`: Cyan text with glow effect
- `subtle-cyan-text`: Subtle cyan text color
- `bet-button-icon`: Bet control button styling
- `control-panel-card`: Main card background

### Tailwind Classes
- `flex`, `flex-col`: Layout
- `items-center`, `justify-between`: Alignment
- `gap-*`: Spacing
- `rounded-full`: Circular buttons
- `transition-all`: Smooth transitions
- `hover:scale-105`: Hover effects

## Data Flow

### Bet Change Flow
```
User clicks +/- button
  ↓
onIncreaseBet() / onDecreaseBet() called
  ↓
Parent (SlotMachine) updates betAmount state
  ↓
totalBet prop updates
  ↓
ControlPanel re-renders with new bet
  ↓
Bet display updates
```

### Spin Flow
```
User clicks SPIN button
  ↓
onSpin() called
  ↓
Parent (SlotMachine) handles spin logic
  ↓
isSpinning prop becomes true
  ↓
Button shows "SPINNING" with spinner
  ↓
Button disabled during spin
  ↓
After spin completes, isSpinning becomes false
  ↓
Button returns to normal state
```

## Feature Symbol Display

When in free spins mode with a feature symbol:

1. **Load Symbol Image**: Uses `useGameConfig()` to get symbol config
2. **Display Image**: Shows symbol image in centered container
3. **Responsive Sizing**: Scales from 80px (mobile) to 128px (desktop)
4. **Fallback**: Shows symbol name as text if image missing

## Dialog Integration

### PayTableDialog
- **Trigger**: Menu icon button
- **Content**: Complete paytable with all symbols
- **Props**: `betPerPayline`, `totalBet`

### InfoDialog
- **Trigger**: Info icon button
- **Content**: Game rules and instructions
- **Props**: None (uses config from context)

### AudioSettingsDialog
- **Trigger**: Volume icon button
- **Content**: Volume slider, music/SFX toggles
- **Props**: All audio-related props

## Common Patterns

### Conditional Rendering
```typescript
{!isFreeSpinsMode && (
  <BetControls />
)}
{isFreeSpinsMode && (
  <FreeSpinsDisplay />
)}
```

### Responsive Classes
```typescript
className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
```

### Currency Formatting
```typescript
{isCurrency ? `R${value}` : value}
```

## Troubleshooting

### Buttons Not Responding
- Check if `isSpinning` is blocking
- Verify callback functions are passed
- Check button disabled state

### Bet Not Updating
- Verify `totalBet` prop is updating
- Check `onIncreaseBet` / `onDecreaseBet` callbacks
- Ensure betAmount state is managed correctly

### Display Values Incorrect
- Check prop values from parent
- Verify currency formatting
- Check number precision (toFixed)

### Mobile Layout Issues
- Verify responsive breakpoints
- Check flex layout classes
- Ensure proper spacing

## Best Practices

1. **Always check disabled state** before allowing interactions
2. **Use consistent styling** across all info displays
3. **Handle loading states** gracefully
4. **Provide visual feedback** for all interactions
5. **Test responsive layouts** on multiple screen sizes

