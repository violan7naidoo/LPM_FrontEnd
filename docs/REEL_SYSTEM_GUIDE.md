# Reel System Guide

## Overview
The reel system consists of multiple components working together to display and animate the slot machine reels. This guide covers `ReelColumn`, `SymbolDisplay`, and related components.

## Component Architecture

```
SlotMachine
  └── ReelGrid (5 columns)
      ├── PaylineNumbers (left/right indicators)
      ├── ReelColumn × 5
      │   └── SymbolDisplay × 3 (per reel)
      └── WinningLinesDisplay (SVG overlay)
```

## ReelColumn Component

### Location
`src/components/game/reel-column.tsx`

### Purpose
Represents a single vertical reel column that displays symbols and handles spinning animations.

### Props
```typescript
interface ReelColumnProps {
  symbols: SymbolId[];                    // Final result symbols (after spin)
  isSpinning: boolean;                    // Whether reel is spinning
  reelIndex: number;                      // Reel index (0-4)
  winningLineIndicesForColumn: number[][]; // Winning payline indices per row
  isTurboMode?: boolean;                   // Turbo mode (faster, no bounce)
  shouldBounce?: boolean;                  // Trigger bounce animation
  isExpanding?: boolean;                  // Reel is expanding (feature game)
  isExpanded?: boolean;                   // Reel is fully expanded
}
```

### Key Features

#### 1. Symbol Display
- Shows 3 symbols vertically (one per row)
- Uses `SymbolDisplay` component for each symbol
- Fixed height: 259px per symbol (for 1296px layout)

#### 2. Spinning Animation
- **When Spinning**: Shows duplicated reel strip for seamless loop
- **Animation**: CSS `animate-reel-spin` class
- **Duration**: 3 seconds (configurable)
- **Seamless Loop**: Duplicates reel strip to prevent gaps

#### 3. Stopping Animation
- **Bounce Effect**: 300ms bounce when reel stops (non-turbo)
- **Sound Sync**: Triggered by `shouldBounce` prop (synced with sound)
- **Turbo Mode**: No bounce animation (faster gameplay)

#### 4. Expanding Animation
- **Feature Game**: Reels can expand during free spins
- **Animation**: CSS `animate-expand-reel` class
- **Visual**: Scale transform on entire reel
- **Border**: Yellow border on all symbols when expanded

### Layout Calculation

```typescript
// Fixed layout for 1296px wide container
const symbolHeightFixed = 259; // 1296px / 5 reels = 259.2px
const gap = 0;                 // No gap between symbols
const borderPadding = 0;       // No extra padding

// Container height
const height = (numRows × symbolHeightFixed) + (gaps) + (padding);
// = (3 × 259) + 0 + 0 = 777px
```

### Symbol Selection Logic

**When Spinning:**
```typescript
const displaySymbols = [...reelStrip, ...reelStrip];
// Duplicates strip for seamless loop
```

**When Stopped:**
```typescript
const displaySymbols = symbols; // Final result from backend
```

## SymbolDisplay Component

### Location
`src/components/game/symbol-display.tsx`

### Purpose
Renders a single symbol with support for static images and animated sequences.

### Props
```typescript
interface SymbolDisplayProps {
  symbolId: SymbolId;           // Symbol to display
  className?: string;            // Additional CSS classes
  winningLineIndices?: number[]; // Payline indices passing through
  isExpandedReel?: boolean;      // Part of expanded reel
}
```

### Key Features

#### 1. Static Symbol Display
- Loads symbol image from config
- Uses Next.js `Image` component for optimization
- Responsive sizing
- Fallback text if image missing

#### 2. Animated Sequences
- **Trigger**: When symbol is part of winning line
- **Component**: `ImageSequenceAnimation`
- **Frames**: 72 frames per symbol
- **Duration**: 3 seconds per loop
- **Path**: `/animations/{symbol}/{symbol}_{frame}.webp`

#### 3. Winning Highlighting
- **Border Color**: 
  - Expanded reel: Yellow (#FFFF00)
  - Winning payline: Payline color from `PAYLINE_COLORS`
- **Glow Effect**: Colored shadow matching border
- **Animation**: Pulse animation (if no sequence available)

#### 4. Visual States

**Normal State:**
- Static symbol image
- No border
- No animation

**Winning State:**
- Colored border (payline color)
- Glow effect
- Animation sequence (if available)
- Pulse animation (fallback)

**Expanded Reel State:**
- Yellow border on all symbols
- No payline highlighting
- Animation sequence (if available)

### Animation Priority

1. **Image Sequence Animation** (if available and winning)
   - Overlays static image
   - Loops continuously while winning
   - Hides static image (opacity-0)

2. **Pulse Animation** (if no sequence)
   - CSS pulse animation
   - Applied to symbol container

3. **Static Image** (normal state)
   - Always present as fallback
   - Visible when animation not playing

## PaylineNumbers Component

### Location
`src/components/game/payline-numbers.tsx`

### Purpose
Displays payline number indicators (1-5) on the left and right sides of the reel grid.

### Features

#### 1. Positioning
- **Left Side**: Based on first reel of payline
- **Right Side**: Based on last reel of payline
- **Blended Position**: 70% start/end + 30% average position
- **Edge Padding**: 12% padding to keep within bounds

#### 2. Overlap Handling
- Groups paylines by start/end positions
- Offsets overlapping paylines vertically
- Spacing: 40px between numbers
- Clamps offsets at edges

#### 3. Visual States
- **Active/Winning**: Colored background matching payline
- **Inactive**: Muted background with border
- **Pulse Animation**: On active paylines

#### 4. Responsive Sizing
- Mobile: 40px × 40px
- Tablet: 48px × 48px
- Desktop: 56px × 56px

## WinningLinesDisplay Component

### Location
`src/components/game/winning-lines-display.tsx`

### Purpose
Overlays colored SVG lines on the reel grid to highlight winning paylines.

### Features

#### 1. SVG Path Generation
- Calculates center points of each symbol
- Connects points with SVG path (M = move, L = line)
- Handles all 5 reels

#### 2. Color System
- Each payline gets unique color from `PAYLINE_COLORS`
- Colors cycle if more paylines than colors
- Special: Yellow for scatter highlights

#### 3. Responsive Rendering
- **Desktop**: 5px stroke, 5px glow
- **Tablet**: 4px stroke, 3px glow
- **Mobile**: 3px stroke, 2px glow

#### 4. ViewBox Calculation
```typescript
width = (symbolWidth × numReels) + (gap × (numReels - 1)) + (padding × 2)
height = (symbolHeight × numRows) + (gap × (numRows - 1)) + (padding × 2)
```

## Coordinate System

### Symbol Positioning
Each symbol cell has coordinates:
```typescript
x = padding + (reel × (symbolWidth + gap)) + (symbolWidth / 2)
y = padding + (row × (symbolHeight + gap)) + (symbolHeight / 2)
```

### Fixed Layout Values
- **Container Width**: 1296px
- **Reel Width**: 259.2px (1296 / 5)
- **Symbol Size**: 259px × 259px
- **Gap**: 0px (no gaps)
- **Padding**: 16px (p-4)

## Animation Details

### Reel Spinning
```css
@keyframes reel-spin {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}
```
- Moves reel strip up by 50% (half its height)
- Creates seamless loop with duplicated strip

### Reel Bounce
```css
@keyframes reel-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```
- 300ms duration
- Only in non-turbo mode
- Synced with reel stop sound

### Expanding Reel
```css
@keyframes expand-reel {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}
```
- Scales entire reel up
- Applied during feature game

## Data Flow

### Symbol Grid Update
```
Backend returns spin result
  ↓
grid state updated with final symbols
  ↓
ReelColumn receives new symbols prop
  ↓
isSpinning becomes false
  ↓
displaySymbols switches to final symbols
  ↓
SymbolDisplay renders final symbols
```

### Winning Line Highlighting
```
Backend returns winningLines
  ↓
winningLines state updated
  ↓
WinningLinesDisplay receives winningLines
  ↓
SVG paths generated for each payline
  ↓
Colored lines drawn over grid
  ↓
SymbolDisplay receives winningLineIndices
  ↓
Borders and animations applied
```

## Performance Considerations

### Optimization Techniques
1. **Memoization**: Expensive calculations memoized
2. **Frame Updates**: Only update when frame changes
3. **Image Optimization**: Next.js Image component
4. **CSS Transforms**: GPU-accelerated animations
5. **Conditional Rendering**: Hide when not needed

### Animation Performance
- Uses `requestAnimationFrame` for smooth 60fps
- Only updates state when frame changes
- CSS transforms instead of position changes
- `will-change-transform` for GPU acceleration

## Common Patterns

### Checking if Symbol is Winning
```typescript
const isWinning = 
  winningLineIndices.length > 0 || 
  isExpandedReel;
```

### Getting Payline Color
```typescript
const color = PAYLINE_COLORS[paylineIndex % PAYLINE_COLORS.length];
```

### Calculating Symbol Position
```typescript
const x = padding + (reel × (width + gap)) + (width / 2);
const y = padding + (row × (height + gap)) + (height / 2);
```

## Troubleshooting

### Reels Not Spinning
- Check `isSpinning` prop
- Verify CSS animation classes
- Check reel strip data

### Symbols Not Displaying
- Verify symbol IDs in grid
- Check image paths in config
- Ensure SymbolDisplay receives correct props

### Winning Lines Not Showing
- Check `winningLines` array
- Verify payline definitions
- Ensure SVG paths are generated

### Animations Not Playing
- Check if animation frames exist
- Verify `isWinning` state
- Check animation file paths

## Best Practices

1. **Always validate symbol IDs** before rendering
2. **Use fixed dimensions** for consistent layout
3. **Optimize animations** with requestAnimationFrame
4. **Handle missing images** gracefully
5. **Test on multiple screen sizes** for responsive design

