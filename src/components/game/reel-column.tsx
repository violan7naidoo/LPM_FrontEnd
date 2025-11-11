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

    // Calculate dynamic height based on numRows and window size
    useEffect(() => {
        // Symbol sizes doubled (2x ratio): h-24 (96px), sm:h-40 (160px), md:h-72 (288px)
        // Gap: gap-4 (16px) - doubled for proportion
        // Formula: (numRows * symbolHeight) + ((numRows - 1) * gap)
        const symbolHeightMobile = 96; // h-24 (2x of h-12)
        const symbolHeightSmall = 160; // sm:h-40 (2x of sm:h-20)
        const symbolHeightMedium = 280; // md:h-72 (2x of md:h-36)
        const gap = 16; // gap-4 (2x of gap-2)
        
        const updateHeight = () => {
            const width = window.innerWidth;
            let height: number;
            
            if (width >= 768) {
                // Medium breakpoint (md)
                height = (numRows * symbolHeightMedium) + ((numRows - 1) * gap);
            } else if (width >= 640) {
                // Small breakpoint (sm)
                height = (numRows * symbolHeightSmall) + ((numRows - 1) * gap);
            } else {
                // Mobile
                height = (numRows * symbolHeightMobile) + ((numRows - 1) * gap);
            }
            
            setContainerHeight(height);
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
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
                } as React.CSSProperties}
            >
                {displaySymbols && displaySymbols.length > 0 
                    ? displaySymbols.slice(0, isSpinning ? (reelStrip.length > 0 ? reelStrip.length * 2 : 0) : numRows).map((symbolId, i) => (
                    <SymbolDisplay 
                        key={i} 
                        symbolId={symbolId} 
                        className="h-24 w-24 sm:h-40 sm:w-40 md:h-72 md:w-72"
                        winningLineIndices={isExpanded ? [] : winningLineIndicesForColumn[i]} // Don't show winning line highlights if entire reel is expanded
                        isExpandedReel={isExpanded} // Pass flag to show yellow border
                    />
                    ))
                    : null}
            </div>
        </div>
    );
}

