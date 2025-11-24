# Game Rules and Functionality - Comprehensive Guide

## Table of Contents

1. [Basic Game Structure](#1-basic-game-structure)
2. [Symbols and Hierarchy](#2-symbols-and-hierarchy)
3. [Winning Rules](#3-winning-rules)
4. [Free Spins Feature](#4-free-spins-feature)
5. [Action Games Feature](#5-action-games-feature)
6. [Bet-Specific Mechanics](#6-bet-specific-mechanics)
7. [Game Modes](#7-game-modes)
8. [Animations and Visual Feedback](#8-animations-and-visual-feedback)
9. [Sound System](#9-sound-system)
10. [Autoplay System](#10-autoplay-system)
11. [Balance and Betting](#11-balance-and-betting)
12. [Session Management](#12-session-management)
13. [Special Rules](#13-special-rules)
14. [UI/UX Features](#14-uiux-features)
15. [Technical Details](#15-technical-details)

---

## 1. Basic Game Structure

### Grid Layout

- **Dimensions**: 5 reels × 3 rows (15 symbol positions total)
- **Container Width**: 1296px (fixed)
- **Symbol Size**: 259px × 259px per symbol
- **Spacing**: No gaps between symbols

### Game Type

- **Style**: Book of Ra-style slot machine
- **Special Symbol**: Scatter (Book) acts as both scatter and wild/substitute

### Available Bet Amounts

- **Options**: R1.00, R2.00, R3.00, R5.00
- **Navigation**: Circular (1 → 2 → 3 → 5 → 1, wraps around)
- **Application**: Bet amount applies to all 5 paylines simultaneously

### Paylines

- **Total**: 5 fixed paylines (always active)
- **Patterns**:
  ```
  Payline 1: [0,0,0,0,0] - Top row straight
  Payline 2: [1,1,1,1,1] - Middle row straight
  Payline 3: [2,2,2,2,2] - Bottom row straight
  Payline 4: [0,1,2,1,0] - V shape
  Payline 5: [2,1,0,1,2] - Inverted V shape
  ```
  *(Row indices: 0 = top, 1 = middle, 2 = bottom)*

---

## 2. Symbols and Hierarchy

### Symbol Types

#### High-Value Symbols

- **Scatter** (Book Symbol): Special symbol with dual function
- **Queen**: Highest paying regular symbol
- **Stone**: High-value symbol
- **Leopard**: Medium-high value
- **Wolf**: Medium-high value

#### Low-Value Symbols

- **A** (Ace)
- **K** (King)
- **Q** (Queen card)
- **J** (Jack)
- **10** (Ten)

### Symbol Functions

#### Scatter Symbol (Book)

- ✅ Triggers free spins (3+ anywhere on reels)
- ✅ Substitutes for other symbols in base game
- ✅ Pays scatter wins (3, 4, or 5 scatters)
- ❌ Cannot substitute during free spins if it's the feature symbol

---

## 3. Winning Rules

### Payline Wins

- **Direction**: Wins pay left to right only
- **Minimum**: 2 matching symbols required
- **Substitution**: Scatter (Book) can substitute for other symbols in base game
- **Free Spins Rule**: During free spins, Scatter only substitutes if it's NOT the selected feature symbol

### Win Calculation Process

1. Determine winning symbol (first non-scatter symbol from left)
2. Count consecutive matches (scatter can substitute)
3. Look up payout based on:
   - Symbol type
   - Number of matches (2, 3, 4, or 5)
   - Current bet amount

### Payout Structure

- Payouts vary by bet amount
- **Example** (Queen at R2.00 bet):
  - 2x Queen = R4.00
  - 3x Queen = R40.00
  - 4x Queen = R70.00
  - 5x Queen = R70.00

### Scatter Wins

| Scatter Count | Reward |
|--------------|--------|
| 3 scatters | Payout + 10 free spins |
| 4 scatters | Higher payout + 10 free spins |
| 5 scatters | Highest payout + 10 free spins |

> **Note**: Scatter payouts are bet-specific

---

## 4. Free Spins Feature

### Trigger

- **Requirement**: 3 or more Scatter symbols anywhere on reels
- **Award**: 10 free spins (configurable)

### Feature Symbol Selection

- Random symbol selected (excluding Scatter)
- Selection animation shown before free spins start
- Selected symbol becomes the "expanding symbol"

### Free Spins Mechanics

- ✅ No bet required
- ✅ Feature symbol expands to fill entire reel when it appears
- ✅ Expanded reels show yellow border
- ✅ Base game wins paid first (before expansion)
- ✅ Feature game wins paid after expansion (if expansion occurs)
- ✅ Scatter can retrigger free spins (10 additional spins)
- ✅ If retriggered, feature symbol remains the same

### Expanding Symbol Rules

- When feature symbol appears on a reel, entire reel expands
- All positions on that reel become the feature symbol
- Expanded wins calculated after expansion
- Multiple reels can expand simultaneously

### Action Games During Free Spins

- ⚠️ Action games can trigger during free spins
- ⚠️ Action game wins accumulate but wheel is **NOT** shown
- ⚠️ Action wheel appears after free spins complete (if accumulated)

---

## 5. Action Games Feature

### Trigger Conditions

- **Requirement**: 5 matching symbols of certain types (varies by symbol and bet)
- **Variation**: Different symbols trigger at different bet levels

#### Example Triggers

| Symbol | Bet | Count | Action Games Awarded |
|--------|-----|-------|----------------------|
| Scatter | R1.00 | 5x | 13 action games |
| Scatter | R2.00 | 5x | 33 action games |
| Queen | R1.00 | 5x | 93 action games |

### Action Game Mechanics

- Awards base win when triggered
- Awards action game spins (wheel spins)

### Action Wheel Outcomes

| Outcome | Description | Occurrences |
|---------|-------------|-------------|
| **"6spins"** | 6 additional action game spins | 1 |
| **"0"** | No additional spins | 3 |
| **"R10"** | R10 cash prize | 8 |

### Action Wheel Behavior

- Spun after action games are triggered
- Each spin can award:
  - Additional spins
  - Cash prize (R10)
  - Nothing (0)
- Continues until no spins remain

### Accumulation Rules

- ⚠️ Action games triggered during free spins accumulate
- ⚠️ Wheel is **NOT** shown during free spins
- ⚠️ Wheel appears after free spins complete (if any accumulated)

### Action Game Spins

- ✅ No bet required
- ✅ Each spin uses one action game spin
- ✅ Wins from action wheel added to balance

---

## 6. Bet-Specific Mechanics

### Payout Variations

- All payouts are bet-specific
- Higher bets may have different payout structures
- **Example**: At R5.00 bet, some symbols have different minimum match requirements

### Action Game Triggers

- Different symbols trigger action games at different bet levels
- Higher bets may trigger action games with fewer symbols
- **Example**: At R5.00 bet, 4x Scatter can trigger action games (3 spins)

### Symbol-Specific Action Games

Each symbol has its own action game trigger table based on:
- Symbol type
- Number of matches
- Current bet amount

---

## 7. Game Modes

### Base Game

- Normal spinning mode
- Bet required for each spin
- All features can trigger

### Free Spins Mode

- ✅ No bet required
- ✅ Feature symbol expands reels
- ✅ Can retrigger additional free spins
- ⚠️ Action games accumulate (not shown)

### Action Game Mode

- ✅ No bet required
- ✅ Spinning action wheel
- ✅ Awards additional spins or cash prizes

### Turbo Mode

- ⚡ Faster animations
- ⚡ No bounce effect on reel stops
- ✅ All other mechanics unchanged

---

## 8. Animations and Visual Feedback

### Reel Animations

- **Spinning**: Continuous scroll (3 seconds)
- **Stopping**: Sequential stop with bounce (non-turbo)
- **Bounce**: 300ms bounce effect per reel

### Win Animations

- **Winning symbols**: Colored borders (payline-specific colors)
- **Glow effect**: Colored shadow on winning symbols
- **Symbol sequences**: 72-frame animations for winning symbols
- **Pulse animation**: Fallback if sequence not available

### Expanding Reels

- Scale animation when reel expands
- Yellow border on all symbols in expanded reel
- Visual feedback during expansion

### Win Celebration

- Coin confetti animation
- Count-up animation for win amount
- Different sounds for regular vs big wins

---

## 9. Sound System

### Background Music

- Loops continuously (if enabled)
- Can be toggled on/off
- Volume adjustable (0-100)

### Sound Effects

| Sound Type | Behavior |
|------------|----------|
| **Spin sound** | Loops while reels spinning |
| **Reel stop** | Plays once per reel stop |
| **Win sounds** | Different for regular vs big wins |
| **Feature sounds** | Special sounds for free spins trigger |

> All SFX can be toggled on/off

---

## 10. Autoplay System

### Configuration

- **Number of spins**: 1-1000
- **Stop conditions**:
  - ✅ Stop on any win
  - ✅ Stop if single win exceeds amount
  - ✅ Stop on feature (free spins)
  - ✅ Stop if total loss exceeds amount

### Execution

- Automatically triggers spins
- Checks stop conditions after each spin
- Updates balance and state
- Shows win animations
- Handles feature games

---

## 11. Balance and Betting

### Balance Management

- Initial balance set by backend
- Updated after each spin
- Deducted before spin (base game only)
- Added after win calculation

### Bet Validation

- ⚠️ Spin disabled if balance insufficient (base game)
- ✅ Free spins don't require balance
- ✅ Action games don't require balance

### Bet Calculation

```
Total bet = bet amount (applies to all 5 paylines)
Bet per payline = bet amount / 5
```

---

## 12. Session Management

### Session ID

- Generated on first spin
- Maintained across spins
- Used for state persistence
- Backend maintains session state

### State Persistence

The following are tracked in session:
- ✅ Balance
- ✅ Free spins remaining
- ✅ Action game spins
- ✅ Feature symbol selected
- ✅ Accumulated action game wins

---

## 13. Special Rules

### Scatter Substitution

| Game Mode | Substitution Rule |
|-----------|------------------|
| **Base game** | Scatter substitutes for any symbol |
| **Free spins** | Only substitutes if NOT the feature symbol |
| **Feature symbol is Scatter** | Scatter does NOT substitute |

### Multiple Wins

- Multiple paylines can win simultaneously
- Each winning payline pays separately
- **Total win** = sum of all payline wins + scatter wins

### Expansion Priority

1. Base game wins calculated first
2. Feature game wins calculated after expansion
3. If symbol meets expansion threshold, it pays **twice**:
   - Base game win (before expansion)
   - Feature game win (after expansion)

### Action Game Priority

| Scenario | Behavior |
|---------|----------|
| **Action games in base game** | Show wheel immediately |
| **Action games during free spins** | Accumulate, show after free spins |
| **Free spins + action games simultaneously** | Free spins play first, then action wheel |

---

## 14. UI/UX Features

### Control Panel

- Balance display
- Bet controls (+/- buttons)
- Spin button (changes text based on mode)
- Turbo mode toggle
- Autoplay button
- Win display
- Info buttons (Paytable, Rules, Audio)

### Paytable Display

- Dynamic paytable updates with bet amount
- Shows all symbol payouts
- Shows action game triggers
- Organized by symbol value

### Responsive Design

- **Desktop**: Horizontal layout
- **Mobile**: Stacked vertical layout
- Scales appropriately for all screen sizes

---

## 15. Technical Details

### Backend Communication

**API Endpoint**: `POST /play`

**Request includes**:
- `sessionId`
- `betAmount`
- `numPaylines`
- `betPerPayline`

**Response includes**:
- `grid`
- `winningLines`
- `totalWin`
- `freeSpins`
- `actionGames`

### Configuration

- Game config loaded from JSON file
- Bet-specific data in config
- Reel strips defined in config
- Feature reel strips for free spins

### Random Number Generation

- Uses Fortuna RNG service
- Cryptographically secure
- Includes `gameId` and `roundId` for audit trails

---

## Summary

This game follows a **Book of Ra-style slot** with:
- ✅ Free spins with expanding symbols
- ✅ Action game wheel feature
- ✅ Bet-specific payouts and triggers
- ✅ Multiple game modes and features
- ✅ Comprehensive animation and sound systems

---

*Last Updated: [Current Date]*
