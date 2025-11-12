'use client';

import type { SymbolId } from '@/lib/slot-config';
import { SymbolDisplay } from './symbol-display';
import { cn } from '@/lib/utils';
import { useNumRows, useReelStrips } from '@/lib/slot-config';
import { useState, useEffect } from 'react';

interface ReelColumnProps {
  symbols: SymbolId[];
  isSpinning: boolean;
  reelIndex: number;
  winningLineIndicesForColumn: number[][];
  isTurboMode?: boolean;
  shouldBounce?: boolean;
  isExpanding?: boolean;
  isExpanded?: boolean; // True if this entire reel is expanded (should show yellow border on all symbols)
}

export function ReelColumn({ symbols, isSpinning, reelIndex, winningLineIndicesForColumn, isTurboMode = false, shouldBounce = false, isExpanding = false, isExpanded = false }: ReelColumnProps) {
    const numRows = useNumRows();
    const reelStrips = useReelStrips();
    const reelStrip = reelStrips[reelIndex] || [];
    const [isStopping, setIsStopping] = useState(false);
    const [containerHeight, setContainerHeight] = useState<number>(0);

    useEffect(() => {
        if (shouldBounce && !isTurboMode) {
            // Trigger bounce when shouldBounce is true (synced with reel stop sound)
            setIsStopping(true);
            const timer = setTimeout(() => setIsStopping(false), 300);
            return () => clearTimeout(timer);
        } else if (!isSpinning && isTurboMode) {
            // No bounce animation for turbo
            setIsStopping(false);
        }
    }, [shouldBounce, isTurboMode, isSpinning]);

    // Calculate dynamic height based on numRows and fixed symbol size for 1296px layout
    // Fixed layout: 1296px wide container, 5 reels
    // Symbol size: ~259px (calculated to fit 1296px with no padding and no gaps)
    useEffect(() => {
        // Fixed symbol size for vertical cabinet layout (1296px wide)
        // Calculation: 1296px / 5 reels = 259.2px per symbol
        const symbolHeightFixed = 259; // Fixed size for 1296px layout
        const gap = 0; // No gap between symbols
        const borderPadding = 0; // No extra padding
        
        // Fixed height calculation for vertical cabinet
        const height = (numRows * symbolHeightFixed) + ((numRows - 1) * gap) + borderPadding;
        setContainerHeight(height);
    }, [numRows]);

    // Duplicate once for seamless loop without extra work
    // Ensure displaySymbols is always an array
    const displaySymbols = isSpinning 
        ? (reelStrip.length > 0 ? [...reelStrip, ...reelStrip] : [])
        : (symbols || []);

    return (
        <div 
            className="overflow-visible contain-paint"
            style={{ height: containerHeight > 0 ? `${containerHeight}px` : 'auto' }}
        >
            <div
                className={cn(
                    'flex flex-col gap-0 transform-gpu will-change-transform relative',
                    isSpinning && 'animate-reel-spin',
                    isStopping && 'animate-reel-bounce',
                    isExpanding && 'animate-expand-reel'
                )}
                style={{
                    animationDuration: isSpinning ? `3s` : undefined,
                    transformOrigin: isExpanding ? 'center center' : undefined,
                    minHeight: containerHeight > 0 ? `${containerHeight}px` : 'auto',
                } as React.CSSProperties}
            >
                {displaySymbols && displaySymbols.length > 0 
                    ? displaySymbols.slice(0, isSpinning ? (reelStrip.length > 0 ? reelStrip.length * 2 : 0) : numRows).map((symbolId, i) => (
                    <SymbolDisplay 
                        key={i} 
                        symbolId={symbolId} 
                        className="w-full h-[259px] flex-shrink-0"
                        winningLineIndices={isExpanded ? [] : winningLineIndicesForColumn[i]} // Don't show winning line highlights if entire reel is expanded
                        isExpandedReel={isExpanded} // Pass flag to show yellow border
                    />
                    ))
                    : null}
            </div>
        </div>
    );
}

