"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useGameConfig } from '@/hooks/use-game-config';

interface FeatureSymbolSelectionProps {
  isOpen: boolean;
  onComplete: () => void;
  selectedSymbol: string;
  freeSpinsCount: number;
}

export function FeatureSymbolSelection({
  isOpen,
  onComplete,
  selectedSymbol,
  freeSpinsCount,
}: FeatureSymbolSelectionProps) {
  const { config } = useGameConfig();
  const [showAnimation, setShowAnimation] = useState(false);
  const [showSymbol, setShowSymbol] = useState(false);
  const [spinningSymbols, setSpinningSymbols] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && config) {
      // Get all eligible symbols (excluding scatter and low-value cards)
      const eligibleSymbols = Object.keys(config.symbols).filter(
        s => s !== 'Scatter' && s !== 'A' && s !== 'K' && s !== 'Q' && s !== 'J' && s !== '10'
      );
      
      // Start animation
      setShowAnimation(true);
      setShowSymbol(false);
      
      // Spin through symbols quickly
      let spinCount = 0;
      const spinInterval = setInterval(() => {
        const randomSymbols = Array.from({ length: 3 }, () => 
          eligibleSymbols[Math.floor(Math.random() * eligibleSymbols.length)]
        );
        setSpinningSymbols(randomSymbols);
        spinCount++;
        
        if (spinCount >= 15) {
          clearInterval(spinInterval);
          // Slow down and show selected symbol
          setTimeout(() => {
            setSpinningSymbols([selectedSymbol, selectedSymbol, selectedSymbol]);
            setTimeout(() => {
              setShowSymbol(true);
              setTimeout(() => {
                onComplete();
              }, 1500);
            }, 500);
          }, 300);
        }
      }, 100);
      
      return () => clearInterval(spinInterval);
    }
  }, [isOpen, selectedSymbol, config, onComplete]);

  if (!isOpen || !config) return null;

  const getSymbolImage = (symbol: string) => {
    const symbolConfig = config.symbols[symbol as keyof typeof config.symbols];
    return symbolConfig?.image || `/images/symbols/${symbol}.png`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center justify-center p-8 bg-gradient-to-br from-yellow-900/90 to-yellow-700/90 rounded-2xl border-4 border-yellow-400 shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold text-yellow-200 mb-4 uppercase tracking-wider text-center">
          Free Spins!
        </h2>
        <p className="text-xl text-yellow-100 mb-6 text-center">
          {freeSpinsCount} Free Spins Awarded
        </p>
        
        <div className="mb-6">
          <p className="text-lg text-yellow-200 mb-4 text-center">
            Selecting Feature Symbol...
          </p>
          
          {showAnimation && !showSymbol && (
            <div className="flex items-center justify-center gap-4">
              {spinningSymbols.map((symbol, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 bg-white/20 rounded-lg border-2 border-yellow-400 flex items-center justify-center animate-pulse"
                >
                  {symbol && (
                    <Image
                      src={getSymbolImage(symbol)}
                      alt={symbol}
                      width={80}
                      height={80}
                      className="object-contain"
                      unoptimized
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {showSymbol && (
            <div className="flex flex-col items-center justify-center animate-scale-in">
              <p className="text-xl text-yellow-200 mb-4 text-center">
                Feature Symbol Selected:
              </p>
              <div className="relative w-32 h-32 bg-white/30 rounded-lg border-4 border-yellow-400 flex items-center justify-center shadow-2xl">
                <Image
                  src={getSymbolImage(selectedSymbol)}
                  alt={selectedSymbol}
                  width={120}
                  height={120}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <p className="text-2xl font-bold text-yellow-200 mt-4 uppercase">
                {selectedSymbol}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

