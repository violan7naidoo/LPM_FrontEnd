'use client';

import { SlotMachine } from './slot-machine';

export function BottomSection() {
  return (
    <div className="flex-[3] flex flex-col w-full h-full overflow-hidden">
      <SlotMachine />
    </div>
  );
}

