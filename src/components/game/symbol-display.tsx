'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useSymbols, type SymbolId } from '@/lib/symbols';
import { cn } from '@/lib/utils';
import { PAYLINE_COLORS } from './winning-lines-display';
import { ImageSequenceAnimation } from './image-sequence-animation';

interface SymbolDisplayProps {
  symbolId: SymbolId;
  className?: string;
  winningLineIndices?: number[];
  isExpandedReel?: boolean; // True if this symbol is part of an expanded reel (should show yellow border)
}

export function SymbolDisplay({ symbolId, className, winningLineIndices = [], isExpandedReel = false }: SymbolDisplayProps) {
  const symbols = useSymbols();
  const symbol = symbols[symbolId];
  
  const isWinning = winningLineIndices.length > 0 || isExpandedReel;

  if (!symbol) {
    return null;
  }
  
  // Check if this symbol has animation frames available
  const hasAnimation = isWinning;

  // Determine border color for winning symbols
  // Expanded reels get yellow border, otherwise use payline color
  const borderColor = isExpandedReel 
    ? '#FFFF00' // Yellow for expanded reels
    : (isWinning ? PAYLINE_COLORS[winningLineIndices[0] % PAYLINE_COLORS.length] : undefined);

  return (
    <div
      className={cn(
        'aspect-square w-full h-full flex items-center justify-center bg-black/30 rounded-lg p-2 transition-all duration-300 relative overflow-hidden',
        // Apply border and shadow styles directly
        isWinning && 'border-2',
        // Use the fallback pulse animation ONLY if animation isn't playing
        isWinning && !hasAnimation && 'animate-pulse-win',
        className
      )}
      style={{
        borderColor: borderColor,
        boxShadow: isWinning ? `0 0 10px ${borderColor}` : undefined
      }}
    >
      {/* Image sequence animation - rendered when symbol is winning */}
      {hasAnimation && (
        <ImageSequenceAnimation
          symbolId={symbolId}
          isPlaying={isWinning}
          duration={3} // Loop every 3 seconds - will keep looping while isWinning is true
          className="absolute inset-0"
        />
      )}

      {/* The static image - always present */}
      {symbol.image ? (
        <Image 
          src={symbol.image} 
          alt={symbolId.toLowerCase()} 
          fill
          sizes="196px"
          className={cn(
            "object-contain drop-shadow-lg transition-opacity duration-300",
            // If animation is playing, the image is hidden; otherwise, it's visible.
            hasAnimation ? 'opacity-0' : 'opacity-100'
          )}
          unoptimized={process.env.NODE_ENV !== 'production'}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white">
          {symbolId}
        </div>
      )}
    </div>
  );
}

SymbolDisplay.displayName = 'SymbolDisplay';

