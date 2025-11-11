'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

interface ImageSequenceAnimationProps {
  symbolId: string;
  isPlaying: boolean;
  duration?: number; // Duration in seconds for one complete cycle
  className?: string;
}

export function ImageSequenceAnimation({ 
  symbolId, 
  isPlaying, 
  duration = 3, 
  className 
}: ImageSequenceAnimationProps) {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const lastFrameRef = useRef<number>(0);
  
  const totalFrames = 72;
  
  const animate = useCallback((currentTime: number) => {
    if (!startTimeRef.current || !isPlaying) return;
    
    const elapsed = (currentTime - startTimeRef.current) / 1000;
    const progress = (elapsed / duration) % 1;
    const frame = Math.floor(progress * totalFrames);
    const adjustedFrame = Math.max(1, Math.min(frame + 1, totalFrames));
    
    // Only update if frame actually changed to prevent unnecessary re-renders
    if (adjustedFrame !== lastFrameRef.current) {
      setCurrentFrame(adjustedFrame);
      lastFrameRef.current = adjustedFrame;
    }
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [duration, isPlaying]);
  
  useEffect(() => {
    if (isPlaying && !isAnimating) {
      setIsAnimating(true);
      setIsReady(false);
      setCurrentFrame(1);
      lastFrameRef.current = 1;
      
      // Small delay to ensure smooth start
      setTimeout(() => {
        startTimeRef.current = performance.now();
        setIsReady(true);
        animationRef.current = requestAnimationFrame(animate);
      }, 16); // One frame delay
    } else if (!isPlaying && isAnimating) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsAnimating(false);
      setIsReady(false);
      setCurrentFrame(0);
      lastFrameRef.current = 0;
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate, isAnimating]);
  
  // Generate the image path for the current frame
  const getImagePath = (frame: number) => {
    const frameNumber = Math.max(1, Math.min(frame, totalFrames));
    
    // Map symbol IDs to their correct folder names
    // Symbol IDs now match image file names, so we can use them directly
    const getFolderName = (id: string) => {
      const folderMap: Record<string, string> = {
        // Card symbols
        'J': 'J',
        'Q': 'Q', 
        'K': 'K',
        'A': 'A',
        '10': '10',
        // High-value symbols
        'Scatter': 'Scatter',
        'Queen': 'Queen',
        'Stone': 'Stone',
        // Medium-value symbols
        'Leopard': 'Leopard',
        'Wolf': 'Wolf',
        // Legacy mappings for backwards compatibility
        'JACK': 'J',
        'QUEEN_CARD': 'Q',
        'KING': 'K',
        'ACE': 'A',
        'TEN': '10',
        'WILD': 'Wild',
        'SCATTER': 'Scatter',
        'CROWN': 'Crown',
        'DRAGON': 'Dragon',
        'LEOPARD': 'Leopard',
        'QUEEN': 'Queen',
        'STONE': 'Stone',
        'WOLF': 'Wolf',
        'BOOK': 'Scatter',
        'ARCHAEOLOGIST': 'Queen',
        'TUTANKHAMUN': 'Stone',
        'SCARAB': 'Leopard',
        'RA': 'Wolf',
      };
      return folderMap[id] || id;
    };
    
    const folderName = getFolderName(symbolId);
    return `/animations/${folderName}/${folderName}_${frameNumber}.webp`;
  };
  
  if (!isPlaying || !isAnimating || !isReady) {
    return null;
  }
  
  return (
    <div className={`absolute inset-0 z-20 ${className}`}>
        <Image
          key={`${symbolId}-${currentFrame}`}
          src={getImagePath(currentFrame)}
          alt={`${symbolId} animation frame ${currentFrame}`}
          fill
          className="object-cover"
          unoptimized
          priority
          quality={90}
        />
    </div>
  );
}

