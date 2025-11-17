/**
 * MiddleSection Component
 * 
 * This component displays an image/video in the middle section of the game.
 * The paytable has been moved to TopSection.
 */

'use client';

import Image from 'next/image';

/**
 * Props interface for MiddleSection component
 */
interface MiddleSectionProps {
  betAmount?: number;
  isFreeSpinsMode?: boolean;
  featureSymbol?: string;
}

/**
 * MiddleSection - Main Component
 * 
 * Displays the main image from public/middle-section/main.png
 */
export function MiddleSection({}: MiddleSectionProps) {
  return (
    <div className="flex-[1.4] flex items-center justify-center bg-transparent overflow-visible" style={{ marginTop: '-180px' }}>
                    <Image
        src="/middle-section/main.png"
        alt="Middle Section"
        width={1296}
        height={637}
        className="object-cover w-full h-full"
        unoptimized
        priority
      />
    </div>
  );
}
