'use client';

import { SlotMachine } from './slot-machine';

export function BottomSection() {
  return (
    <div className="flex-[3] flex flex-col w-full h-full overflow-hidden justify-start">
      <div className="w-full mt-12">
        <SlotMachine />
      </div>
    </div>
  );
}

