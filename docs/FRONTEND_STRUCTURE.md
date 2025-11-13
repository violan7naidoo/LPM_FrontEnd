# Frontend Structure Documentation

## Overview
This document maps out the complete structure of the FrontEndBookOfRa slot game frontend application.

## Project Structure

```
FrontEndBookOfRa/
├── src/
│   ├── app/                    # Next.js App Router directory
│   │   ├── globals.css         # Global styles and game container CSS
│   │   ├── layout.tsx          # Root layout with GameConfigProvider
│   │   └── page.tsx            # Main game page (entry point)
│   │
│   ├── components/
│   │   ├── game/               # Game-specific components
│   │   │   ├── TopSection.tsx           # Top section (Action Games Wheel)
│   │   │   ├── MiddleSection.tsx        # Paytable display (main focus)
│   │   │   ├── BottomSection.tsx       # Slot machine reels and controls
│   │   │   ├── slot-machine.tsx        # Main slot machine logic
│   │   │   ├── reel-column.tsx         # Individual reel column component
│   │   │   ├── symbol-display.tsx       # Symbol rendering component
│   │   │   ├── control-panel.tsx        # Bet controls and spin button
│   │   │   ├── payline-numbers.tsx     # Payline indicators
│   │   │   ├── winning-lines-display.tsx # Win animation overlay
│   │   │   ├── win-animation.tsx        # Win celebration animations
│   │   │   ├── info-dialog.tsx          # Game information modal
│   │   │   ├── pay-table-dialog.tsx     # Paytable modal dialog
│   │   │   ├── autoplay-dialog.tsx      # Autoplay settings dialog
│   │   │   ├── audio-settings-dialog.tsx # Audio settings dialog
│   │   │   ├── feature-symbol-selection.tsx # Feature game symbol picker
│   │   │   └── image-sequence-animation.tsx # Image sequence animations
│   │   │
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── toast.tsx
│   │   │   └── toaster.tsx
│   │   │
│   │   └── icons/              # Icon components
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-game-config.tsx  # Game configuration context/hook
│   │   └── use-toast.ts         # Toast notification hook
│   │
│   └── lib/                     # Utility libraries and types
│       ├── game-api.ts          # Backend API communication
│       ├── game-config-types.ts # TypeScript type definitions
│       ├── slot-config.ts       # Slot machine configuration helpers
│       ├── sounds.ts            # Audio/sound management
│       ├── symbols.ts           # Symbol-related utilities
│       └── utils.ts             # General utility functions
│
├── public/
│   ├── config/                  # Game configuration JSON files
│   │   └── BOOK_OF_RA.json      # Main game config (payouts, symbols, etc.)
│   └── images/                  # Game assets
│       ├── symbols/             # Symbol images
│       └── backround/           # Background images
│
└── docs/                        # Documentation (this folder)
    └── FRONTEND_STRUCTURE.md    # This file
```

## Component Hierarchy

### Main Application Flow

```
page.tsx (Root)
├── GameConfigProvider (Context Provider)
│   └── Game Container
│       ├── TopSection
│       │   └── ActionGameWheel (future)
│       │
│       ├── MiddleSection ⭐ (Paytable - Main Focus)
│       │   ├── PayCell (High-value symbols)
│       │   ├── LowPayCell (Card symbols)
│       │   └── 10 PENNY GAMES overlay
│       │
│       └── BottomSection
│           └── SlotMachine
│               ├── ReelGrid
│               │   ├── ReelColumn (x5)
│               │   │   └── SymbolDisplay
│               │   └── PaylineNumbers
│               │
│               ├── ControlPanel
│               │   ├── Bet Controls
│               │   ├── Spin Button
│               │   └── Info Buttons
│               │
│               └── Dialogs
│                   ├── InfoDialog
│                   ├── PayTableDialog
│                   ├── AutoplayDialog
│                   └── AudioSettingsDialog
```

## Key Components Explained

### 1. page.tsx
- **Purpose**: Main entry point of the application
- **Responsibilities**:
  - Manages `betAmount` state (lifted from slot-machine)
  - Calculates `betPerPayline` (betAmount / 5 paylines)
  - Renders the three main sections (Top, Middle, Bottom)
  - Passes props down to child components

### 2. MiddleSection.tsx ⭐
- **Purpose**: Displays dynamic paytable that updates with bet changes
- **Key Features**:
  - 4x2 grid layout showing all symbol payouts
  - Dynamic data fetching from `useGameConfig` hook
  - Bet-specific payout display (changes when betAmount changes)
  - Action games (AG) display in red
  - Central "10 PENNY GAMES" feature overlay
- **Components**:
  - `PayCell`: High-value symbols (Scatter, Queen, Stone, Wolf, Leopard)
  - `LowPayCell`: Low-value card symbols (A, K, Q, J, 10)

### 3. slot-machine.tsx
- **Purpose**: Main game logic and reel spinning
- **Responsibilities**:
  - Manages spin state and animations
  - Handles bet increase/decrease (circular through betAmounts)
  - Communicates with backend API for game results
  - Displays win animations
  - Manages feature games and free spins

### 4. use-game-config.tsx
- **Purpose**: Provides game configuration context
- **Functionality**:
  - Loads config from `/public/config/BOOK_OF_RA.json`
  - Provides config to all components via React Context
  - Handles loading and error states

## Data Flow

### Bet Amount Flow
```
page.tsx (betAmount state)
    ↓
MiddleSection (receives betAmount prop)
    ↓
PayCell/LowPayCell (receives betKey = betAmount.toFixed(2))
    ↓
Config lookup: symbol.payout[betKey] and symbol.actionGames[betKey]
    ↓
Display updated payouts
```

### Configuration Flow
```
public/config/BOOK_OF_RA.json
    ↓
useGameConfig hook (loads on mount)
    ↓
GameConfigContext (provides to all components)
    ↓
Components access via useGameConfig()
```

## State Management

### Global State (Context)
- **GameConfig**: Loaded from JSON, provided via context
- **GameId**: Determines which config file to load

### Component State
- **betAmount**: Managed in `page.tsx`, passed down as props
- **Spin State**: Managed in `slot-machine.tsx`
- **Dialog States**: Managed in individual dialog components

## Styling

### CSS Architecture
- **Tailwind CSS**: Utility-first CSS framework
- **globals.css**: Contains game container styles and custom classes
- **Component-level**: Inline Tailwind classes

### Key Style Classes
- `game-container`: Main game wrapper (1296px × 2550px)
- `bg-black/40`: Semi-transparent black background
- `border-yellow-400/50`: Yellow border for paytable blocks
- `text-yellow-400`: Yellow text for payout amounts
- `text-red-500`: Red text for action games (AG)

## Configuration Files

### BOOK_OF_RA.json Structure
```json
{
  "gameName": "Frosty Fortunes",
  "betAmounts": [1.00, 2.00, 3.00, 5.00],
  "symbols": {
    "Scatter": {
      "payout": {
        "1.00": { "3": 2.00, "4": 20.00, "5": 70.00 },
        "2.00": { "3": 4.00, "4": 40.00, "5": 70.00 }
      },
      "actionGames": {
        "1.00": { "5": 13 },
        "2.00": { "5": 33 }
      }
    }
  }
}
```

## Key Features

1. **Dynamic Paytable**: Updates automatically when bet changes
2. **Bet-Specific Payouts**: Different payouts for R1, R2, R3, R5 bets
3. **Action Games Display**: Shows AG values in red when available
4. **Responsive Layout**: Grid-based layout with proper spacing
5. **Visual Consistency**: All blocks use same styling (yellow borders, dark backgrounds)

## Development Notes

- All game components are client-side (`'use client'`)
- Next.js Image component used for optimized image loading
- TypeScript for type safety
- Tailwind CSS for styling
- React Context for configuration sharing

