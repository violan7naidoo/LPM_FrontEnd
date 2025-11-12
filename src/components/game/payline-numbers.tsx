"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { PAYLINE_COLORS } from "./winning-lines-display";
import { usePaylines, useNumRows } from "@/lib/slot-config";

interface PaylineNumbersProps {
  winningLines: Array<{
    paylineIndex: number;
    symbol: string;
    count: number;
    payout: number;
    line: number[];
  }>;
  isSpinning: boolean;
  numPaylines?: number;
  children: ReactNode;
}

export function PaylineNumbers({ winningLines, isSpinning, numPaylines = 5, children }: PaylineNumbersProps) {
  const paylines = usePaylines();
  const numRows = useNumRows();
  
  // Get unique payline indices from winning lines (only active paylines)
  const activePaylines = [...new Set(winningLines.map(line => line.paylineIndex).filter(index => index !== -1 && index < numPaylines))];
  
  // Create array of all 5 paylines (1-5) - show all but highlight only active ones
  const paylineNumbers = Array.from({ length: 5 }, (_, i) => i + 1);
  
  // Helper function to convert row index to percentage position
  // Row 0 = top, Row 1 = middle, Row 2 = bottom
  // Can handle decimal values for blended positions
  // Adds padding to keep numbers within bounds (number is 24px tall, so need ~12px padding from edges)
  const getRowPosition = (rowIndex: number, edgePadding: number = 0.12): string => {
    if (numRows === 1) return '50%';
    // Clamp to valid range [0, numRows - 1]
    const clampedIndex = Math.max(0, Math.min(rowIndex, numRows - 1));
    // Calculate base position (0 to 1)
    const basePosition = clampedIndex / (numRows - 1);
    // Add padding to keep numbers within bounds
    // edgePadding represents the percentage of space to reserve at top and bottom
    // For example, 0.12 = 12% padding means positions range from 12% to 88% instead of 0% to 100%
    const paddedPosition = edgePadding + (basePosition * (1 - (edgePadding * 2)));
    return `${paddedPosition * 100}%`;
  };
  
  // Calculate the average row position for a payline (to position numbers closer to the actual line path)
  const getAverageRowPosition = (payline: number[]): number => {
    if (payline.length === 0) return 0;
    const sum = payline.reduce((acc, row) => acc + row, 0);
    return sum / payline.length;
  };
  
  // Group paylines by their start/end positions to handle overlaps
  // Left side: group by first reel position, but also consider the path
  const leftGroups = new Map<number, number[]>();
  // Right side: group by last reel position, but also consider the path
  const rightGroups = new Map<number, number[]>();
  
  paylineNumbers.forEach((number) => {
    const paylineIndex = number - 1;
    const payline = paylines[paylineIndex];
    if (!payline || payline.length === 0) return;
    
    const leftRow = payline[0];
    const rightRow = payline[payline.length - 1];
    
    if (!leftGroups.has(leftRow)) {
      leftGroups.set(leftRow, []);
    }
    leftGroups.get(leftRow)!.push(paylineIndex);
    
    if (!rightGroups.has(rightRow)) {
      rightGroups.set(rightRow, []);
    }
    rightGroups.get(rightRow)!.push(paylineIndex);
  });
  
  // Sort groups by their average position to position numbers more intelligently
  const sortGroupByPosition = (group: number[], isLeft: boolean): number[] => {
    return [...group].sort((a, b) => {
      const paylineA = paylines[a];
      const paylineB = paylines[b];
      if (!paylineA || !paylineB) return 0;
      
      // Use average position of the payline path for better positioning
      const avgA = getAverageRowPosition(paylineA);
      const avgB = getAverageRowPosition(paylineB);
      return avgA - avgB;
    });
  };
  
  // Helper to get offset for paylines sharing the same position
  // Increased spacing significantly - each number is 24px, need at least 30px spacing to prevent overlap
  const getOffset = (paylineIndex: number, group: number[], isLeft: boolean, maxOffset: number = 40): number => {
    const sortedGroup = sortGroupByPosition(group, isLeft);
    const indexInGroup = sortedGroup.indexOf(paylineIndex);
    const totalInGroup = sortedGroup.length;
    
    if (totalInGroup === 1) return 0;
    
    // Calculate spacing based on number of overlapping paylines
    // For 2 paylines: spread 40px apart
    // For 3 paylines: spread 60px apart
    // For 4+ paylines: spread even more
    const totalSpread = maxOffset * Math.max(1, totalInGroup - 1);
    const spacing = totalSpread / Math.max(1, totalInGroup - 1);
    
    // Center the group around the base position
    const centerOffset = -(totalSpread / 2);
    return centerOffset + (indexInGroup * spacing);
  };

  return (
    <div className="flex items-center justify-center w-full h-full relative">
      {/* Left side payline numbers */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-14 md:w-16 flex flex-col justify-between items-center z-10">
        {paylineNumbers.map((number) => {
          const paylineIndex = number - 1;
          const isActive = activePaylines.includes(paylineIndex);
          const paylineColor = PAYLINE_COLORS[paylineIndex % PAYLINE_COLORS.length];
          
          // Get the payline definition (array of row indices for each reel)
          const payline = paylines[paylineIndex];
          if (!payline || payline.length === 0) return null;
          
          // Left side position: based on first reel (index 0) of the payline
          // But also consider the average position of the payline path for better alignment
          const leftRowIndex = payline[0];
          const avgRowPosition = getAverageRowPosition(payline);
          // Use a blend of start position and average position (70% start, 30% average)
          // But ensure we don't go below 0 or above numRows-1
          const blendedRowPosition = Math.max(0, Math.min(
            leftRowIndex * 0.7 + avgRowPosition * 0.3,
            numRows - 1
          ));
          const leftPosition = getRowPosition(blendedRowPosition);
          const leftGroup = leftGroups.get(leftRowIndex) || [];
          const leftOffset = getOffset(paylineIndex, leftGroup, true);
          
          // Ensure the final position stays within bounds by clamping the offset
          // The number is now larger (w-10 h-10 = 40px, md:w-14 md:h-14 = 56px), so we need more space
          // With edgePadding of 12%, we have more space, but still clamp offset to be safe
          // Reduce max offset when we're at the edges (row 0 or row 2)
          const isAtEdge = leftRowIndex === 0 || leftRowIndex === numRows - 1;
          const maxOffsetFromEdge = isAtEdge ? 30 : 40; // Less offset at edges, more in middle
          const clampedLeftOffset = Math.max(-maxOffsetFromEdge, Math.min(leftOffset, maxOffsetFromEdge));
          
          return (
            <div
              key={`left-${number}`}
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-base sm:text-lg md:text-xl font-bold transition-all duration-300 absolute",
                isActive ? "text-white shadow-lg animate-pulse" : paylineIndex < numPaylines ? "bg-black/50 text-muted-foreground border-2 border-primary/30" : "bg-black/20 text-muted-foreground/50 border-2 border-primary/10 opacity-50"
              )}
              style={{
                ...(isActive ? {
                  backgroundColor: paylineColor,
                  boxShadow: `0 0 15px ${paylineColor}50, 0 0 30px ${paylineColor}30`
                } : {}),
                top: leftPosition,
                transform: `translateY(calc(-50% + ${clampedLeftOffset}px))`
              }}
            >
              {number}
            </div>
          );
        })}
      </div>

      {/* Grid content */}
      <div className="flex-1 w-full h-full">
        {children}
      </div>

      {/* Right side payline numbers */}
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-14 md:w-16 flex flex-col justify-between items-center z-10">
        {paylineNumbers.map((number) => {
          const paylineIndex = number - 1;
          const isActive = activePaylines.includes(paylineIndex);
          const paylineColor = PAYLINE_COLORS[paylineIndex % PAYLINE_COLORS.length];
          
          // Get the payline definition (array of row indices for each reel)
          const payline = paylines[paylineIndex];
          if (!payline || payline.length === 0) return null;
          
          // Right side position: based on last reel of the payline
          // But also consider the average position of the payline path for better alignment
          const rightRowIndex = payline[payline.length - 1];
          const avgRowPosition = getAverageRowPosition(payline);
          // Use a blend of end position and average position (70% end, 30% average)
          // But ensure we don't go below 0 or above numRows-1
          const blendedRowPosition = Math.max(0, Math.min(
            rightRowIndex * 0.7 + avgRowPosition * 0.3,
            numRows - 1
          ));
          const rightPosition = getRowPosition(blendedRowPosition);
          const rightGroup = rightGroups.get(rightRowIndex) || [];
          const rightOffset = getOffset(paylineIndex, rightGroup, false);
          
          // Ensure the final position stays within bounds by clamping the offset
          // The number is now larger (w-10 h-10 = 40px, md:w-14 md:h-14 = 56px), so we need more space
          // Reduce max offset when we're at the edges (row 0 or row 2)
          const isAtEdge = rightRowIndex === 0 || rightRowIndex === numRows - 1;
          const maxOffsetFromEdge = isAtEdge ? 30 : 40; // Less offset at edges, more in middle
          const clampedRightOffset = Math.max(-maxOffsetFromEdge, Math.min(rightOffset, maxOffsetFromEdge));
          
          return (
            <div
              key={`right-${number}`}
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-base sm:text-lg md:text-xl font-bold transition-all duration-300 absolute",
                isActive ? "text-white shadow-lg animate-pulse" : paylineIndex < numPaylines ? "bg-black/50 text-muted-foreground border-2 border-primary/30" : "bg-black/20 text-muted-foreground/50 border-2 border-primary/10 opacity-50"
              )}
              style={{
                ...(isActive ? {
                  backgroundColor: paylineColor,
                  boxShadow: `0 0 15px ${paylineColor}50, 0 0 30px ${paylineColor}30`
                } : {}),
                top: rightPosition,
                transform: `translateY(calc(-50% + ${clampedRightOffset}px))`
              }}
            >
              {number}
            </div>
          );
        })}
      </div>
    </div>
  );
}

