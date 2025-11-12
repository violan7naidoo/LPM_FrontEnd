'use client';

import { useEffect, useState, useCallback } from 'react';
import { Coins } from 'lucide-react';

interface WinAnimationProps {
  feedback: {
    feedbackText: string;
    winAmount: number;
    animationType?: string;
  };
  onAnimationComplete: () => void;
  onCountComplete?: (amount: number) => void;
}

const Coin = ({ id, onEnded }: { id: number; onEnded: (id: number) => void }) => {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    setStyle({
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 2 + 3}s`,
      animationDelay: `${Math.random() * 2}s`,
    });

    const timer = setTimeout(() => onEnded(id), 5000); // Duration + Delay
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only depend on id, not onEnded to prevent infinite loops

  return (
    <div
      style={style}
      className="absolute top-[-10%] text-yellow-400 animate-fall"
    >
      <Coins className="w-8 h-8 md:w-12 md:h-12 drop-shadow-lg" style={{ transform: `rotate(${Math.random() * 360}deg)`}}/>
    </div>
  );
};

// Generate win message based on amount
const getWinMessage = (winAmount: number): string => {
  if (winAmount <= 5) {
    return 'Congratulations!';
  } else if (winAmount <= 10) {
    return 'Well done!';
  } else if (winAmount <= 15) {
    return 'Nice win!';
  } else if (winAmount <= 25) {
    return 'Great job!';
  } else if (winAmount <= 50) {
    return 'Excellent!';
  } else if (winAmount <= 100) {
    return 'Outstanding!';
  } else if (winAmount <= 200) {
    return 'Incredible!';
  } else if (winAmount <= 300) {
    return 'Amazing!';
  } else {
    return 'MEGA WIN!';
  }
};

export function WinAnimation({ feedback, onAnimationComplete, onCountComplete }: WinAnimationProps) {
  const [coins, setCoins] = useState<number[]>([]);
  const [show, setShow] = useState(false);
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    // Reset state when feedback changes
    setShow(false);
    setDisplayAmount(0);
    setCoins([]);
    
    const showTimer = setTimeout(() => setShow(true), 500);

    if (feedback.animationType?.includes('coin') || !feedback.animationType) {
      const newCoins = Array.from({ length: 50 }, (_, i) => i);
      setCoins(newCoins);
    }

    // Counter animation for win amount using requestAnimationFrame for smoothness
    const targetAmount = feedback.winAmount;
    // Fixed slower duration for all wins to build anticipation
    const duration = 4000; // 4 seconds for all wins - slow and satisfying
    const startTime = performance.now();
    let animationFrameId: number | undefined;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic for more natural counting
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentAmount = targetAmount * easeProgress;
      
      setDisplayAmount(currentAmount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayAmount(targetAmount);
        // Notify when counting is complete
        if (onCountComplete) {
          onCountComplete(targetAmount);
        }
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    // Fixed timer based on counting duration + fade time
    const totalDuration = duration + 1000; // Add 1 second for fade out (5 seconds total)
    const animationTimer = setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          onAnimationComplete();
        }, 500);
    }, totalDuration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(animationTimer);
      if (animationFrameId !== undefined) {
        cancelAnimationFrame(animationFrameId);
      }
    }
    // Only depend on feedback.winAmount to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback.winAmount, feedback.feedbackText, feedback.animationType]);
  
  const handleCoinEnd = useCallback((id: number) => {
    setCoins(prev => prev.filter(cId => cId !== id));
  }, []);

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
      <div className="absolute inset-0 overflow-hidden">
        {(feedback.animationType?.includes('coin') || !feedback.animationType) && coins.map(id => <Coin key={id} id={id} onEnded={handleCoinEnd} />)}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-black/70 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-yellow-400 max-w-[90%] sm:max-w-lg text-center animate-fade-in-scale">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-headline text-yellow-400 drop-shadow-lg leading-tight mb-2">
                {feedback.feedbackText}
            </h2>
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-yellow-400 drop-shadow-lg">
                R {displayAmount.toFixed(2)}
            </p>
        </div>
      </div>
       <style jsx>{`
        @keyframes fall {
          from {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          to {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
        }
        @keyframes fade-in-scale {
            0% {
                opacity: 0;
                transform: scale(0.5);
            }
            100% {
                opacity: 1;
                transform: scale(1);
            }
        }
        .animate-fade-in-scale {
            animation: fade-in-scale 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
      `}</style>
    </div>
  );
}

// Helper function to generate win feedback
export function getWinningFeedback(winAmount: number, winningSymbols: string[] = [], betAmount: number = 0): {
  feedbackText: string;
  winAmount: number;
  animationType: string;
} {
  const feedbackText = getWinMessage(winAmount);
  const animationType = 'coins'; // Can be extended to support other types
  
  return {
    feedbackText,
    winAmount,
    animationType
  };
}

