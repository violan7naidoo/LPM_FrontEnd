'use client';

import { SlotMachine } from './slot-machine';

interface BottomSectionProps {
  betAmount: number;
  setBetAmount: (amount: number) => void;
  betPerPayline: number;
}

export function BottomSection({ betAmount, setBetAmount, betPerPayline }: BottomSectionProps) {
  return (
    <div className="flex-[3] flex flex-col w-full h-full overflow-hidden justify-start">
      <div className="w-full">
        <SlotMachine 
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          betPerPayline={betPerPayline}
        />
      </div>
    </div>
  );
}

