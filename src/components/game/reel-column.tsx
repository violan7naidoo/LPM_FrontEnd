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

    // Calculate dynamic height based on numRows and fixed symbol size for 1080px layout
    // Fixed layout: 1080px wide container, 5 reels
    // Symbol size: ~196px (calculated to fit 1080px with padding and gaps)
    useEffect(() => {
        // Fixed symbol size for vertical cabinet layout (1080px wide)
        // Calculation: (1080px - 32px padding - 64px gaps) / 5 reels = 196.8px per symbol
        const symbolHeightFixed = 196; // Fixed size for 1080px layout
        const gap = 16; // gap-4
        const borderPadding = 8; // Extra padding for borders (4px border + 4px margin)
        
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
            className="overflow-hidden contain-paint"
            style={{ height: containerHeight > 0 ? `${containerHeight}px` : 'auto' }}
        >
            <div
                className={cn(
                    'flex flex-col gap-4 transform-gpu will-change-transform relative',
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
                        className="w-[196px] h-[196px] flex-shrink-0"
                        winningLineIndices={isExpanded ? [] : winningLineIndicesForColumn[i]} // Don't show winning line highlights if entire reel is expanded
                        isExpandedReel={isExpanded} // Pass flag to show yellow border
                    />
                    ))
                    : null}
            </div>
        </div>
    );
}

