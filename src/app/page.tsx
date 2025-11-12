'use client';

import { useState } from 'react';
import { TopSection } from "@/components/game/TopSection";
import { MiddleSection } from "@/components/game/MiddleSection";
import { BottomSection } from "@/components/game/BottomSection";
import { useBetAmounts } from '@/lib/slot-config';

export default function Home() {
  const betAmounts = useBetAmounts();
  const [betAmount, setBetAmount] = useState(betAmounts[0] || 1.00);
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

