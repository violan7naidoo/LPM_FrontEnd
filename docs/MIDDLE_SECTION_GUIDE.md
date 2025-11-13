# MiddleSection Component Guide

## Overview
The `MiddleSection` component is responsible for displaying the dynamic paytable that shows all symbol payouts and action games. It updates automatically when the player changes their bet amount.

## Component Structure

### Main Component: `MiddleSection`
- **Location**: `src/components/game/MiddleSection.tsx`
- **Props**: `{ betAmount: number }`
- **Purpose**: Renders the complete paytable grid

### Helper Components

#### 1. `PayCell`
Displays a single high-value symbol with its payout information.

**Props:**
- `symbolId`: Symbol identifier (e.g., "Scatter", "Queen", "Stone")
- `betKey`: Bet amount as string key (e.g., "1.00", "2.00")
- `config`: Game configuration object
- `hidePayouts`: Optional array of payout counts to hide (e.g., [2])

**Renders:**
- Symbol image (left side)
- Payout information (right side):
  - 5x payout + AG (if available)
  - 4x payout + AG (if available)
  - 3x payout + AG (if available)
  - 2x payout + AG (if available, unless hidden)

**Styling:**
- Background block: `bg-black/40 rounded-lg p-6 border-4 border-yellow-400/50`
- Payout amounts: Yellow (`text-yellow-400`)
- Action games: Red (`text-red-500`)

#### 2. `LowPayCell`
Displays multiple low-value symbols grouped together with shared payouts.

**Props:**
- `symbolIds`: Array of symbol IDs (e.g., ["A", "K"] or ["Q", "J", "10"])
- `betKey`: Bet amount as string key
- `config`: Game configuration object
- `hidePayouts`: Optional array of payout counts to hide

**Renders:**
- Multiple overlapping symbol images (left side)
- Shared payout information (right side):
  - 5x payout + AG (if available)
  - 4x payout + AG (if available)
  - 3x payout + AG (if available)

**Special Features:**
- Symbols overlap using negative margin (`marginLeft: -16px`)
- Uses first symbol's payout data (all symbols in group share same payouts)

## Layout Structure

### Grid Layout
```
┌─────────────────────────────────────────────────┐
│  Row 1: Scatter + SUBSTITUTES FOR (combined)  │
├──────────────────┬──────────────────────────────┤
│  Row 2: Queen    │  Row 2: Stone (right-aligned)│
├──────────────────┼──────────────────────────────┤
│  Row 3: Wolf     │  Row 3: Leopard (right-aligned)│
├──────────────────┼──────────────────────────────┤
│  Row 4: A, K     │  Row 4: Q, J, 10 (right-aligned)│
└──────────────────┴──────────────────────────────┘
         │
         └─── 10 PENNY GAMES (overlay, centered)
```

### Row Details

**Row 1 (Top):**
- Single block spanning both columns (`col-span-2`)
- Left: Scatter symbol with payouts
- Right: SUBSTITUTES FOR section with symbol images
- Layout: `justify-between` to space content

**Row 2:**
- Left: Queen symbol (`w-fit` wrapper)
- Right: Stone symbol (`w-fit` wrapper, right-aligned)

**Row 3:**
- Left: Wolf symbol (`w-fit` wrapper)
- Right: Leopard symbol (`w-fit` wrapper, right-aligned)

**Row 4:**
- Left: A, K symbols (LowPayCell)
- Right: Q, J, 10 symbols (LowPayCell, right-aligned)

**Center Overlay:**
- "10 PENNY GAMES" feature block
- Positioned absolutely in center
- Height: 40% of container (min 350px)

## Data Flow

### 1. Bet Amount Processing
```typescript
betAmount (number) → betKey (string)
Example: 2.00 → "2.00"
```

### 2. Symbol Organization
```typescript
config.symbols → {
  scatterSymbol: "Scatter",
  highPaySymbols: ["Queen", "Stone", "Wolf", "Leopard"],
  lowPaySymbols: ["A", "K", "Q", "J", "10"]
}
```

### 3. Payout Lookup
```typescript
symbol.payout[betKey][count] → payout amount
symbol.actionGames[betKey][count] → action games amount

Example:
betKey = "2.00"
count = "5"
→ symbol.payout["2.00"]["5"] = 70.00
→ symbol.actionGames["2.00"]["5"] = 33
```

## Styling Details

### Block Styling
- **Background**: `bg-black/40` (40% opacity black)
- **Border**: `border-4 border-yellow-400/50` (4px yellow border, 50% opacity)
- **Padding**: `p-6` (24px)
- **Border Radius**: `rounded-lg` (8px)

### Text Styling
- **Payout Amounts**: `text-yellow-400 font-bold` (yellow, bold)
- **Action Games**: `text-red-500 font-bold` (red, bold)
- **Labels**: `text-white` (white)
- **Font Size**: `text-xl` (20px) for payouts, `text-2xl` (24px) for labels

### Spacing
- **Grid Gap**: `gap-x-12` (48px horizontal), `gap-y-6` (24px vertical)
- **Content Gap**: `gap-8` (32px) between symbol and payouts
- **Symbol Gap**: `gap-2` (8px) between multiple symbols

### Width Constraints
- **Right Column Blocks**: `w-fit` to prevent excessive width
- **Left Column Blocks**: `w-fit` for consistency
- **Grid Max Width**: `max-w-6xl` (1152px)

## Key Functions

### `formatPayout(count: number)`
Formats and displays a single payout line.

**Parameters:**
- `count`: Number of matching symbols (2, 3, 4, or 5)

**Returns:**
- JSX element with formatted payout, or `null` if hidden

**Format:**
```
"5x 70.00 + 13AG"
│   │      │
│   │      └─ Action games (red, only if > 0)
│   └──────── Payout amount (yellow)
└──────────── Count (white)
```

## Configuration Requirements

### Required Config Structure
```typescript
{
  symbols: {
    [symbolId]: {
      name: string;
      image: string;
      payout: {
        [betKey]: {
          [count]: number  // payout amount
        }
      };
      actionGames?: {
        [betKey]: {
          [count]: number  // action games amount
        }
      }
    }
  };
  bookSymbol: string;  // Scatter symbol ID
}
```

## Common Patterns

### Hiding Payouts
```typescript
// Hide 2x payout for Scatter
<PayCell hidePayouts={[2]} ... />

// Hide 2x and 3x payouts
<PayCell hidePayouts={[2, 3]} ... />
```

### Right-Aligning Blocks
```typescript
<div className="flex justify-end">
  <div className="w-fit">
    <PayCell ... />
  </div>
</div>
```

### Conditional Rendering
```typescript
{ag > 0 && (
  <span className="text-red-500 font-bold">
    {' '}+ {ag}AG
  </span>
)}
```

## Troubleshooting

### Payouts Not Updating
- Check that `betAmount` prop is changing
- Verify `betKey` format matches config keys (e.g., "2.00" not "2")
- Ensure config has data for the bet amount

### Symbols Not Displaying
- Verify symbol IDs match config keys
- Check that `config.symbols[symbolId]` exists
- Ensure image paths are correct

### Layout Issues
- Check grid container has `relative` positioning for overlay
- Verify `w-fit` wrappers are applied correctly
- Ensure flex containers have proper alignment

## Future Enhancements

1. **Animation**: Add fade-in animations when bet changes
2. **Highlighting**: Highlight changed payouts when bet updates
3. **Tooltips**: Add tooltips explaining action games
4. **Responsive**: Make layout responsive for smaller screens
5. **Accessibility**: Add ARIA labels for screen readers

