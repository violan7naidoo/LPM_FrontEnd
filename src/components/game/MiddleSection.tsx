/**
 * MiddleSection Component
 * 
 * This component displays an image/video in the middle section of the game.
 * The paytable has been moved to TopSection.
 * Can also display the Action Wheel when action games are triggered.
 * Can also display the Feature Symbol Selection when free spins are triggered.
 */

'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ActionWheel, ActionWheelHandle } from './action-wheel';
import { FeatureSymbolSelection } from './feature-symbol-selection';

/**
 * Props interface for MiddleSection component
 */
interface MiddleSectionProps {
  betAmount?: number;
  isFreeSpinsMode?: boolean;
  featureSymbol?: string;
  showActionWheel?: boolean;
  actionGameSpins?: number;
  accumulatedActionWin?: number;
  onActionWheelSpin?: () => Promise<{ result: string; win: number; additionalSpins: number }>;
  onActionWheelComplete?: () => void;
  onActionWheelSpinTriggerReady?: (trigger: () => void) => void;
  onActionWheelWin?: (winAmount: number, result: string, additionalSpins: number, remainingSpins: number) => void;
  showFeatureSymbolSelection?: boolean;
  selectedFeatureSymbol?: string;
  freeSpinsCount?: number;
  onFeatureSymbolSelectionComplete?: () => void;
}

/**
 * MiddleSection - Main Component
 * 
 * Displays the main image from public/middle-section/main.png
 * Or displays the Action Wheel when showActionWheel is true
 */
export function MiddleSection({
  showActionWheel = false,
  actionGameSpins = 0,
  accumulatedActionWin = 0,
  onActionWheelSpin,
  onActionWheelComplete,
  onActionWheelSpinTriggerReady,
  onActionWheelWin,
  showFeatureSymbolSelection = false,
  selectedFeatureSymbol = '',
  freeSpinsCount = 0,
  onFeatureSymbolSelectionComplete,
}: MiddleSectionProps) {
  const actionWheelRef = useRef<ActionWheelHandle>(null);

  return (
    <div className="flex-[1.4] flex items-center justify-center bg-transparent overflow-visible relative" style={{ marginTop: '-180px' }}>
      {showFeatureSymbolSelection ? (
        <div className="w-full h-full flex items-center justify-center">
          <FeatureSymbolSelection
            isOpen={showFeatureSymbolSelection}
            onComplete={onFeatureSymbolSelectionComplete || (() => {})}
            selectedSymbol={selectedFeatureSymbol}
            freeSpinsCount={freeSpinsCount}
          />
        </div>
      ) : showActionWheel ? (
        <ActionWheel
          ref={actionWheelRef}
          isOpen={showActionWheel}
          totalActionSpins={actionGameSpins}
          accumulatedWin={accumulatedActionWin}
          onSpin={onActionWheelSpin || (async () => ({ result: '0', win: 0, additionalSpins: 0 }))}
          onComplete={onActionWheelComplete || (() => {})}
          onSpinTriggerReady={onActionWheelSpinTriggerReady}
          onWin={onActionWheelWin}
        />
      ) : (
        <Image
          src="/middle-section/main.png"
          alt="Middle Section"
          width={1296}
          height={637}
          className="object-cover w-full h-full"
          unoptimized
          priority
        />
      )}
    </div>
  );
}