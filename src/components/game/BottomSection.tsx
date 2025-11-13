/**
 * BottomSection Component
 * 
 * This component is the container for the slot machine reels and control panel.
 * It takes up the largest portion of the game layout (3/6 of vertical space).
 * 
 * Props:
 * @param betAmount - Current bet amount (e.g., 1.00, 2.00, 3.00, 5.00)
 * @param setBetAmount - Function to update the bet amount
 * @param betPerPayline - Calculated bet per payline (betAmount / numPaylines)
 * 
 * Layout:
 * - flex-[3]: Takes 3/6 of vertical space (largest section)
 * - Contains the SlotMachine component which includes:
 *   - Reel grid (5 reels × 3 rows)
 *   - Control panel (bet controls, spin button, info buttons)
 *   - Win animations and dialogs
 * 
 * Data Flow:
 * - Receives betAmount state from page.tsx
 * - Passes betAmount and setBetAmount down to SlotMachine
 * - SlotMachine handles bet increment/decrement and communicates with backend
 */

'use client';

import { SlotMachine } from './slot-machine';

/**
 * Props interface for BottomSection component
 */
interface BottomSectionProps {
  betAmount: number;
  setBetAmount: (amount: number) => void;
  betPerPayline: number;
  onFreeSpinsStateChange?: (isFreeSpinsMode: boolean, featureSymbol: string) => void;
}

export function BottomSection({ betAmount, setBetAmount, betPerPayline, onFreeSpinsStateChange }: BottomSectionProps) {
  return (
    // Main container: flex-[3] means this section takes 3/6 (half) of the vertical space
    // flex flex-col: Vertical flex layout
    // overflow-hidden: Prevents content from spilling outside container
    // justify-start: Aligns content to the top
    <div className="flex-[3] flex flex-col w-full h-full overflow-hidden justify-start">
      {/* Wrapper for SlotMachine - ensures full width */}
      <div className="w-full">
        {/* 
          SlotMachine Component
          - Main game logic and reel spinning
          - Handles bet controls (circular increment/decrement)
          - Manages spin state and animations
          - Communicates with backend API
          - Displays win animations and feature games
        */}
        <SlotMachine 
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          betPerPayline={betPerPayline}
          onFreeSpinsStateChange={onFreeSpinsStateChange}
        />
      </div>
    </div>
  );
}

