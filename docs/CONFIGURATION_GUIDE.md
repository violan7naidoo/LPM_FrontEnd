# Configuration Guide

## Overview
This guide explains the game configuration system, including how configs are loaded, structured, and used throughout the application.

## Configuration Files

### Location
- **Frontend Config**: `/public/config/{gameId}.json`
- **Backend Config**: `/BackEnd/.../GameConfigs/{gameId}.json`

### File Naming
- Format: `{GAME_ID}.json`
- Example: `BOOK_OF_RA.json`
- Case-sensitive

## Configuration Structure

### Root Level
```json
{
  "gameId": "BOOK_OF_RA",
  "gameName": "Book of Ra",
  "numReels": 5,
  "numRows": 3,
  "betAmounts": [1.00, 2.00, 3.00, 5.00],
  "freeSpinsAwarded": 10,
  "maxPaylines": 5,
  "bookSymbol": "Scatter",
  "symbols": { ... },
  "paylines": [ ... ],
  "reelStrips": [ ... ]
}
```

### Symbols Configuration
```json
{
  "symbols": {
    "Scatter": {
      "name": "Scatter",
      "image": "/images/symbols/Scatter.png",
      "payout": {
        "1.00": { "3": 2.00, "4": 20.00, "5": 70.00 },
        "2.00": { "3": 4.00, "4": 40.00, "5": 70.00 },
        "3.00": { "3": 6.00, "4": 60.00, "5": 70.00 },
        "5.00": { "3": 10.00, "4": 100.00, "5": 70.00 }
      },
      "actionGames": {
        "1.00": { "5": 13 },
        "2.00": { "5": 33 },
        "3.00": { "5": 68 },
        "5.00": { "5": 133 }
      }
    },
    "Queen": {
      "name": "Queen",
      "image": "/images/symbols/Queen.png",
      "payout": {
        "1.00": { "2": 1.00, "3": 8.00, "4": 70.00, "5": 70.00 },
        "2.00": { "2": 2.00, "3": 16.00, "4": 70.00, "5": 70.00 }
      },
      "actionGames": {
        "1.00": { "4": 1, "5": 33 },
        "2.00": { "4": 9, "5": 73 }
      }
    }
  }
}
```

### Paylines Configuration
```json
{
  "paylines": [
    [0, 0, 0, 0, 0],  // Payline 1: All top row
    [1, 1, 1, 1, 1],  // Payline 2: All middle row
    [2, 2, 2, 2, 2],  // Payline 3: All bottom row
    [0, 1, 2, 1, 0],  // Payline 4: V shape
    [2, 1, 0, 1, 2]   // Payline 5: Inverted V shape
  ]
}
```

### Reel Strips Configuration
```json
{
  "reelStrips": [
    ["Queen", "Stone", "A", "K", "Q", "J", "10", "Scatter", ...],  // Reel 0
    ["Leopard", "Wolf", "A", "K", "Q", "J", "10", "Scatter", ...], // Reel 1
    ["Queen", "Stone", "A", "K", "Q", "J", "10", "Scatter", ...],  // Reel 2
    ["Leopard", "Wolf", "A", "K", "Q", "J", "10", "Scatter", ...], // Reel 3
    ["Queen", "Stone", "A", "K", "Q", "J", "10", "Scatter", ...]  // Reel 4
  ]
}
```

## Configuration Loading

### Loading Process
1. **Game ID Resolution**:
   - Check URL parameter (`?gameId=...`)
   - Check environment variable (`NEXT_PUBLIC_GAME_ID`)
   - Use default (`'BOOK_OF_RA'`)

2. **File Fetch**:
   - Fetch from `/config/{gameId}.json`
   - Path maps to `public/config/{gameId}.json`

3. **Validation**:
   - Check required fields
   - Validate data types
   - Ensure symbols and paylines exist

4. **Context Provision**:
   - Store in React Context
   - Available via `useGameConfig()` hook

### Loading Code
```typescript
// In use-game-config.tsx
useEffect(() => {
  async function loadConfig() {
    const response = await fetch(`/config/${gameId}.json`);
    const config = await response.json();
    
    // Validate
    if (!config.numReels || !config.symbols) {
      throw new Error('Invalid config');
    }
    
    setConfig(config);
  }
  loadConfig();
}, [gameId]);
```

## Configuration Access

### Using useGameConfig Hook
```typescript
import { useGameConfig } from '@/hooks/use-game-config';

function MyComponent() {
  const { config, loading, error } = useGameConfig();
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!config) return null;
  
  // Use config...
  const symbols = config.symbols;
  const paylines = config.paylines;
}
```

### Using Configuration Hooks
```typescript
import { 
  useNumReels, 
  useNumRows, 
  useBetAmounts,
  usePaylines,
  useReelStrips 
} from '@/lib/slot-config';

function MyComponent() {
  const numReels = useNumReels();        // 5
  const numRows = useNumRows();          // 3
  const betAmounts = useBetAmounts();    // [1.00, 2.00, 3.00, 5.00]
  const paylines = usePaylines();        // [[0,0,0,0,0], ...]
  const reelStrips = useReelStrips();   // [[...], ...]
}
```

## Bet-Specific Data

### Payout Structure
```typescript
symbol.payout[betKey][count] = payoutAmount

// Example:
symbol.payout["2.00"]["5"] = 70.00
// Meaning: 5x Queen at R2 bet = R70.00
```

### Action Games Structure
```typescript
symbol.actionGames[betKey][count] = actionGamesAmount

// Example:
symbol.actionGames["2.00"]["5"] = 33
// Meaning: 5x Scatter at R2 bet = 33 action games
```

### Bet Key Format
- Always use 2 decimal places: `"1.00"`, `"2.00"`, `"3.00"`, `"5.00"`
- Convert number to string: `betAmount.toFixed(2)`
- Match exactly with config keys

## Symbol Configuration

### Required Fields
- `name`: Display name
- `image`: Path to symbol image

### Optional Fields
- `payout`: Bet-specific payouts
- `actionGames`: Bet-specific action games

### Image Paths
- Format: `/images/symbols/{symbolName}.png`
- Must exist in `public/images/symbols/`
- Case-sensitive

## Payline Configuration

### Format
- Array of arrays
- Each inner array: `[row0, row1, row2, row3, row4]`
- Row indices: 0 (top), 1 (middle), 2 (bottom)

### Example Paylines
```typescript
[
  [0, 0, 0, 0, 0],  // Straight across top
  [1, 1, 1, 1, 1],  // Straight across middle
  [2, 2, 2, 2, 2],  // Straight across bottom
  [0, 1, 2, 1, 0],  // V shape
  [2, 1, 0, 1, 2]   // Inverted V
]
```

## Reel Strips Configuration

### Purpose
Defines which symbols appear on each reel during spinning animation.

### Format
- 2D array: `[reel][symbolIndex]`
- Each reel: Array of symbol IDs
- Used for spinning animation

### Fallback
If not in config, generates fallback with all symbols on all reels.

## Configuration Validation

### Required Fields
- `numReels`: Number (typically 5)
- `numRows`: Number (typically 3)
- `symbols`: Object with at least one symbol
- `paylines`: Array with at least one payline

### Optional Fields
- `gameId`: String identifier
- `gameName`: Display name
- `betAmounts`: Array of numbers
- `freeSpinsAwarded`: Number
- `maxPaylines`: Number
- `bookSymbol`: String (Book of Ra style)
- `reelStrips`: 2D array

## Dynamic Configuration

### Bet-Specific Payouts
Payouts can vary by bet amount:
- R1 bet: Different payouts
- R2 bet: Different payouts
- R3 bet: Different payouts
- R5 bet: Different payouts

### Accessing Bet-Specific Data
```typescript
const betKey = betAmount.toFixed(2); // "2.00"
const payout = symbol.payout?.[betKey]?.[count];
const actionGames = symbol.actionGames?.[betKey]?.[count];
```

## Configuration Updates

### Frontend Config
Update `/public/config/{gameId}.json`:
1. Edit JSON file
2. Restart dev server (if needed)
3. Config reloads automatically

### Backend Config
Update `/BackEnd/.../GameConfigs/{gameId}.json`:
1. Edit JSON file
2. Restart backend server
3. Changes apply to new spins

### Keeping in Sync
- Frontend and backend configs should match
- Update both when making changes
- Test after updates

## Common Configuration Patterns

### Adding a New Symbol
```json
{
  "symbols": {
    "NewSymbol": {
      "name": "New Symbol",
      "image": "/images/symbols/NewSymbol.png",
      "payout": {
        "1.00": { "3": 5.00, "4": 20.00, "5": 100.00 },
        "2.00": { "3": 10.00, "4": 40.00, "5": 100.00 }
      }
    }
  }
}
```

### Adding Action Games
```json
{
  "actionGames": {
    "1.00": { "5": 13 },
    "2.00": { "5": 33 },
    "3.00": { "5": 68 }
  }
}
```

### Modifying Payouts
```json
{
  "payout": {
    "2.00": {
      "2": 2.00,   // 2x = R2.00
      "3": 16.00,  // 3x = R16.00
      "4": 70.00,  // 4x = R70.00
      "5": 70.00   // 5x = R70.00
    }
  }
}
```

## Troubleshooting

### Config Not Loading
- Check file path: `/public/config/{gameId}.json`
- Verify JSON syntax (use JSON validator)
- Check browser console for errors
- Ensure file exists

### Payouts Not Updating
- Verify bet key format: `"2.00"` not `"2"`
- Check config has data for bet amount
- Ensure frontend and backend configs match

### Symbols Not Displaying
- Check image paths exist
- Verify symbol IDs match config keys
- Check image file names match paths

### Paylines Not Working
- Verify payline array format
- Check row indices are 0, 1, or 2
- Ensure 5 values per payline

## Best Practices

1. **Always validate** config structure
2. **Use TypeScript types** for type safety
3. **Keep frontend/backend in sync**
4. **Test after config changes**
5. **Document custom fields**
6. **Use consistent naming** conventions
7. **Validate bet keys** format

