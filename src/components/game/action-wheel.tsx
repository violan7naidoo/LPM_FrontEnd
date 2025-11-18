/**
 * ActionWheel Component
 * 
 * Displays a 12-segment action game wheel that players can spin for prizes.
 * The wheel shows accumulated action spins and wins, and allows players to spin
 * for R10 wins, 6 additional spins, or nothing.
 */

'use client';

import { useState, useEffect, useCallback, useImperativeHandle, forwardRef, useMemo } from 'react';
import useSound from 'use-sound';
import { SOUNDS } from '@/lib/sounds';

interface ActionWheelProps {
  isOpen: boolean;
  totalActionSpins: number;
  accumulatedWin: number;
  onSpin: () => Promise<{ result: string; win: number; additionalSpins: number }>;
  onComplete: () => void;
  onSpinTriggerReady?: (trigger: () => void) => void;
  onWin?: (winAmount: number, result: string, additionalSpins: number, remainingSpins: number) => void;
}

export interface ActionWheelHandle {
  spin: () => void;
}

// 12 segments arranged like a clock, starting from 12 o'clock going clockwise
// 12 o'clock: 6 free spins
// Then clockwise: R10, nothing, R10, R10, R10, nothing, R10, R10, R10, nothing, R10
const WHEEL_SEGMENTS = [
  '6',    // 0: 12 o'clock - 6 free spins
  'R10',  // 1: 1 o'clock
  '',     // 2: 2 o'clock - nothing
  'R10',  // 3: 3 o'clock
  'R10',  // 4: 4 o'clock
  'R10',  // 5: 5 o'clock
  '',     // 6: 6 o'clock - nothing
  'R10',  // 7: 7 o'clock
  'R10',  // 8: 8 o'clock
  'R10',  // 9: 9 o'clock
  '',     // 10: 10 o'clock - nothing
  'R10'   // 11: 11 o'clock
];

export const ActionWheel = forwardRef<ActionWheelHandle, ActionWheelProps>(({
  isOpen,
  totalActionSpins,
  accumulatedWin,
  onSpin,
  onComplete,
  onSpinTriggerReady,
  onWin,
}, ref) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [spinResult, setSpinResult] = useState<string | null>(null);

  // Sound configuration - using default settings (can be made configurable later)
  const soundConfig = useMemo(() => ({
    soundEnabled: true,
    volume: 0.5, // 50% volume
  }), []);

  // Sound hooks
  const [playSpinSound, { stop: stopSpinSound }] = useSound(SOUNDS.spin, {
    ...soundConfig,
    loop: true, // Loop while spinning
  });
  const [playWinSound] = useSound(SOUNDS.win, { ...soundConfig, loop: false });

  // Reset when wheel opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSegment(0);
      setSelectedSegment(null);
      setSpinResult(null);
      setIsSpinning(false);
    } else {
      // Stop spin sound when wheel closes
      stopSpinSound();
    }
  }, [isOpen, stopSpinSound]);

  const handleSpin = useCallback(async () => {
    if (isSpinning || totalActionSpins <= 0) return;

    setIsSpinning(true);
    setSpinResult(null);
    setSelectedSegment(null);

    // Play spin sound
    stopSpinSound();
    playSpinSound();

    // Cycle through all 12 segments for visual effect
    const totalCycles = 2; // Go around wheel 2 full times
    const totalSteps = totalCycles * 12;
    const stepDelay = 50; // ms per step

    for (let i = 0; i < totalSteps; i++) {
      setCurrentSegment(i % 12);
      await new Promise(resolve => setTimeout(resolve, stepDelay));
    }

    // Call backend to get actual result
    try {
      const spinResponse = await onSpin();
      
      // Map backend result to segment index
      // Backend returns: "R10", "6spins", or "0"
      // The wheel is arranged like a clock, so we need to find the correct segment
      let selectedIndex = 0;
      if (spinResponse.result === 'R10') {
        // Find all R10 segments (positions 1, 3, 4, 5, 7, 8, 9, 11) and randomly select one
        const r10Indices = WHEEL_SEGMENTS.map((s, i) => s === 'R10' ? i : -1).filter(i => i !== -1);
        selectedIndex = r10Indices[Math.floor(Math.random() * r10Indices.length)];
      } else if (spinResponse.result === '6spins') {
        // 6 spins is at position 0 (12 o'clock)
        selectedIndex = 0;
      } else {
        // Find an empty segment (positions 2, 6, 10) and randomly select one
        const emptyIndices = WHEEL_SEGMENTS.map((s, i) => s === '' ? i : -1).filter(i => i !== -1);
        selectedIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      }

      // Continue cycling to the selected segment (slow down as we approach)
      const finalSteps = selectedIndex + 12; // Add one more full rotation
      for (let i = totalSteps; i < totalSteps + finalSteps; i++) {
        const segmentIndex = i % 12;
        const isLastStep = i === totalSteps + finalSteps - 1;
        
        // Always show yellow on the current segment, including the last step
        setCurrentSegment(segmentIndex);
        
        const delay = stepDelay * (1 + (i - totalSteps) / finalSteps * 3); // Gradually slow down
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // After the delay on the last step, switch to green
        if (isLastStep) {
          // Clear the yellow highlight and show green selected segment
          setCurrentSegment(-1); // Clear active segment to remove yellow highlight
          setSelectedSegment(selectedIndex); // Set selected segment to show green
        }
      }

      // Store the result but don't display it yet
      // We'll check totalActionSpins after parent updates it
      // For now, just store the result
      setSpinResult(spinResponse.result);

      // Stop spin sound when spinning ends
      stopSpinSound();

      // Wait a brief moment to ensure green segment is visible
      await new Promise(resolve => setTimeout(resolve, 300));

      // Play win sound if user won R10 or 6 spins
      if (spinResponse.result === 'R10' || spinResponse.result === '6spins') {
        playWinSound();
      }

      // Calculate remaining spins after this spin
      // Current totalActionSpins - 1 (this spin) + additionalSpins (if any)
      const remainingSpins = totalActionSpins - 1 + spinResponse.additionalSpins;

      // Notify parent about the win (for win message in TopSection)
      // This will trigger the win message display and balance update
      // Pass remainingSpins so parent can check if this was the final spin
      if (onWin) {
        onWin(spinResponse.win, spinResponse.result, spinResponse.additionalSpins, remainingSpins);
      }

      // Allow next spin immediately after green segment lands and win is notified
      setIsSpinning(false);

      // Note: totalActionSpins will be updated by parent component after onSpin completes
      // The parent will handle calling onComplete when spins reach 0
    } catch (error) {
      console.error('Error spinning wheel:', error);
      stopSpinSound(); // Stop spin sound on error
      setIsSpinning(false);
    }
  }, [isSpinning, totalActionSpins, onSpin, onComplete, playSpinSound, stopSpinSound, playWinSound, onWin]);

  // Expose handleSpin via ref and callback so parent can trigger it from keyboard
  useImperativeHandle(ref, () => ({
    spin: () => {
      if (!isSpinning && totalActionSpins > 0) {
        handleSpin();
      }
    },
  }), [isSpinning, totalActionSpins, handleSpin]);

  // Expose spin trigger via callback prop
  useEffect(() => {
    if (onSpinTriggerReady) {
      onSpinTriggerReady(() => {
        if (!isSpinning && totalActionSpins > 0) {
          handleSpin();
        }
      });
    }
  }, [onSpinTriggerReady, isSpinning, totalActionSpins, handleSpin]);

  if (!isOpen) return null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="relative w-full max-w-xl mx-auto">
        {/* Wheel Container */}
        <div className="relative w-full aspect-square">
          {/* Outer Wheel Circle with SVG for proper circular segments */}
          <div className="relative w-full h-full">
            <svg className="w-full h-full transform -rotate-[105deg]" viewBox="0 0 350 350">
              <circle cx="175" cy="175" r="165" fill="none" stroke="#facc15" strokeWidth="6" />
              {/* Segments */}
              {WHEEL_SEGMENTS.map((segment, index) => {
                const startAngle = (index * 30) * (Math.PI / 180);
                const endAngle = ((index + 1) * 30) * (Math.PI / 180);
                const radius = 165;
                const centerX = 175;
                const centerY = 175;
                
                const x1 = centerX + radius * Math.cos(startAngle);
                const y1 = centerY + radius * Math.sin(startAngle);
                const x2 = centerX + radius * Math.cos(endAngle);
                const y2 = centerY + radius * Math.sin(endAngle);
                
                const isActive = currentSegment === index;
                const isSelected = selectedSegment === index;
                const fillColor = isSelected ? '#22c55e' : isActive ? '#eab308' : segment === 'R10' ? '#1f2937' : segment === '6' ? '#1f2937' : '#374151';
                
                const textX = centerX + (radius * 0.7) * Math.cos(startAngle + (endAngle - startAngle) / 2);
                const textY = centerY + (radius * 0.7) * Math.sin(startAngle + (endAngle - startAngle) / 2);
                const textAngle = (startAngle + (endAngle - startAngle) / 2) * (180 / Math.PI) + 90;
                
                return (
                  <g key={index}>
                    <path
                      d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`}
                      fill={fillColor}
                      stroke="#facc15"
                      strokeWidth="2"
                      opacity={isActive ? 0.8 : isSelected ? 0.9 : 0.7}
                    />
                    {/* Segment Text */}
                    {segment === '6' ? (
                      <g transform={`rotate(${textAngle} ${textX} ${textY})`}>
                        <text
                          x={textX}
                          y={textY - 6}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="20"
                          fontWeight="bold"
                        >
                          6
                        </text>
                        <text
                          x={textX}
                          y={textY + 10}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="14"
                          fontWeight="bold"
                        >
                          Spins
                        </text>
                      </g>
                    ) : segment === 'R10' ? (
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="20"
                        fontWeight="bold"
                        transform={`rotate(${textAngle} ${textX} ${textY})`}
                      >
                        R10
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>

            {/* Center Hub */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-28 h-28 rounded-full bg-yellow-400 border-2 border-yellow-600 flex flex-col items-center justify-center shadow-2xl">
                <div className="text-[10px] font-bold text-red-600">AG</div>
                <div className="text-2xl font-bold text-red-600">{totalActionSpins}</div>
                <div className="text-[10px] font-bold text-red-600">RUN</div>
                {/* Only show accumulated win when all spins are complete */}
                {accumulatedWin > 0 && totalActionSpins === 0 && (
                  <div className="text-[10px] font-bold text-green-600 mt-0.5">
                    R{accumulatedWin.toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            {/* Pointer/Selector at top */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-red-600"></div>
            </div>
          </div>
        </div>

        {/* Result Display - Only show when all action spins are complete (totalActionSpins === 0) */}
        {spinResult && totalActionSpins === 0 && (
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {spinResult === 'R10' ? 'You won R10.00!' : 
               spinResult === '6spins' ? 'You won 6 additional spins!' : 
               'No win this spin'}
            </div>
          </div>
        )}

        {/* Accumulated Win Display - Only show when all action spins are complete (totalActionSpins === 0) */}
        {accumulatedWin > 0 && totalActionSpins === 0 && (
          <div className="mt-4 text-center">
            <div className="text-lg text-white">
              Total Accumulated: <span className="font-bold text-green-400">R{accumulatedWin.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ActionWheel.displayName = 'ActionWheel';

