/**
 * Home Page Component (Main Game Page)
 * 
 * This is the main entry point for the slot game application.
 * It manages the top-level game state and renders the three main sections.
 * 
 * Responsibilities:
 * - Manages betAmount state (lifted from slot-machine for sharing)
 * - Calculates betPerPayline (betAmount / numPaylines)
 * - Renders game layout (TopSection, MiddleSection, BottomSection)
 * - Passes state down to child components
 * 
 * Layout Structure:
 * - TopSection: Action Games Wheel (placeholder)
 * - MiddleSection: Dynamic paytable (receives betAmount)
 * - BottomSection: Slot machine and controls (receives betAmount, setBetAmount)
 * 
 * State Management:
 * - betAmount: Managed here, passed down as props
 * - betPerPayline: Calculated here, passed to BottomSection
 * - numPaylines: Static value (always 5)
 */

'use client';

import { useState } from 'react';
import { TopSection } from "@/components/game/TopSection";
import { MiddleSection } from "@/components/game/MiddleSection";
import { BottomSection } from "@/components/game/BottomSection";
import { useBetAmounts } from '@/lib/slot-config';

export default function Home() {
  // Get available bet amounts from config (e.g., [1.00, 2.00, 3.00, 5.00])
  const betAmounts = useBetAmounts();
  
  /**
   * betAmount state - lifted from slot-machine.tsx to enable sharing
   * 
   * Initialized to first bet amount from config (or 1.00 as fallback)
   * This state is shared between:
   * - MiddleSection: Displays payouts for current bet
   * - BottomSection: Passed to SlotMachine for bet controls
   */
  const [betAmount, setBetAmount] = useState(betAmounts[0] || 1.00);
  
  /**
   * Static configuration
   * - numPaylines: Always 5 paylines (fixed for this game)
   * - betPerPayline: Calculated as betAmount divided by numPaylines
   *   Used for display purposes and passed to control panel
   */
  const numPaylines = 5; // Always 5 paylines (static)
  const betPerPayline = betAmount / numPaylines;

  return (
    <div className="game-container">
      <TopSection />
      <MiddleSection betAmount={betAmount} />
      <BottomSection 
        betAmount={betAmount} 
        setBetAmount={setBetAmount} 
        betPerPayline={betPerPayline} 
      />
    </div>
  );
}

