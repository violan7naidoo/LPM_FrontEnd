'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ReelColumn } from './reel-column';
import { WinningLinesDisplay } from './winning-lines-display';
import { PaylineNumbers } from './payline-numbers';
import { ControlPanel } from './control-panel';
import { AutoplayDialog } from './autoplay-dialog';
import { FeatureSymbolSelection } from './feature-symbol-selection';
import { WinAnimation, getWinningFeedback } from './win-animation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { gameApi, type PlayResponse, type SpinResult } from '@/lib/game-api';
import { 
  useNumReels, 
  useNumRows, 
  useBetAmounts, 
  useFreeSpinsAwarded, 
  useReelStrips,
  usePaylines,
  type SymbolId,
  type WinningLine
} from '@/lib/slot-config';
import { useGameConfig } from '@/hooks/use-game-config';
import useSound from 'use-sound';
import { SOUNDS } from '@/lib/sounds';

interface SlotMachineProps {
  betAmount: number;
  setBetAmount: (amount: number) => void;
  betPerPayline: number;
  onFreeSpinsStateChange?: (isFreeSpinsMode: boolean, featureSymbol: string) => void;
}

export function SlotMachine({ betAmount, setBetAmount, betPerPayline, onFreeSpinsStateChange }: SlotMachineProps) {
  // Get config values from hooks
  const numReels = useNumReels();
  const numRows = useNumRows();
  const betAmounts = useBetAmounts();
  const freeSpinsAwarded = useFreeSpinsAwarded();
  const reelStrips = useReelStrips();
  const paylines = usePaylines();
  const { config } = useGameConfig();
  const { toast } = useToast();
  
  // Get scatter symbol for preventing consecutive scatters
  const scatterSymbol = config?.bookSymbol || config?.scatterSymbol || 'Scatter';

  // Generate initial grid (for visual purposes only)
  const generateInitialGrid = useCallback((): SymbolId[][] => {
    if (!config) return [];
    const firstSymbol = Object.keys(config.symbols)[0] as SymbolId;
    return Array(numReels).fill(null).map(() => Array(numRows).fill(firstSymbol));
  }, [numReels, numRows, config]);

  const [grid, setGrid] = useState<SymbolId[][]>(generateInitialGrid);
  useEffect(() => {
    if (!config || reelStrips.length === 0) return;
    // Randomize the grid on the client
    // Prevent consecutive scatter symbols on the same reel
    setGrid(
      Array(numReels)
        .fill(null)
        .map((_, reelIndex) => {
          const reel: SymbolId[] = [];
              const reelStrip = reelStrips[reelIndex] || [];
          
          for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
            let symbol: SymbolId;
            
            if (reelStrip.length > 0) {
              // Get random symbol from strip
              let symbolIndex = Math.floor(Math.random() * reelStrip.length);
              symbol = reelStrip[symbolIndex];
              
              // Prevent consecutive scatter symbols on the same reel
              if (rowIndex > 0 && reel[rowIndex - 1] === scatterSymbol && symbol === scatterSymbol) {
                // Find next non-scatter symbol in the strip
                let attempts = 0;
                let nextIndex = (symbolIndex + 1) % reelStrip.length;
                while (reelStrip[nextIndex] === scatterSymbol && attempts < reelStrip.length) {
                  nextIndex = (nextIndex + 1) % reelStrip.length;
                  attempts++;
                }
                symbol = reelStrip[nextIndex];
              }
            } else {
              symbol = Object.keys(config.symbols)[0] as SymbolId;
            }
            
            reel.push(symbol);
          }
          
          return reel;
        })
    );
  }, [numReels, numRows, reelStrips, config, scatterSymbol]);
  
  // Initialize spinning reels array based on config
  useEffect(() => {
    setSpinningReels(Array(numReels).fill(false));
  }, [numReels]);
  
  const [spinningReels, setSpinningReels] = useState<boolean[]>([]);
  const [balance, setBalance] = useState(500); // Start at 500
  const [numPaylines] = useState(5); // Always 5 paylines (static)
  const totalBet = betAmount; // Total bet is the bet amount selected
  const [lastWin, setLastWin] = useState(0);
  const [winningLines, setWinningLines] = useState<WinningLine[]>([]);
  const [baseGameWinningLines, setBaseGameWinningLines] = useState<WinningLine[]>([]);
  const [featureGameWinningLines, setFeatureGameWinningLines] = useState<WinningLine[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);
  const [actionGameSpins, setActionGameSpins] = useState(0);
  const [featureSymbol, setFeatureSymbol] = useState<string>('');
  const [bouncingReels, setBouncingReels] = useState<boolean[]>(Array(numReels).fill(false));
  const [expandingReels, setExpandingReels] = useState<boolean[]>(Array(numReels).fill(false));
  const [reelsToExpand, setReelsToExpand] = useState<number[]>([]); // Track which reels are expanded
  const [showFeatureGameWins, setShowFeatureGameWins] = useState(false);
  const [isTurboMode, setIsTurboMode] = useState(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);
  const [volume, setVolume] = useState(50);
  
  // Sound configuration
  const soundConfig = useMemo(() => ({
    soundEnabled: isSfxEnabled,
    volume: volume / 100, // Convert 0-100 to 0-1
  }), [isSfxEnabled, volume]);

  const musicConfig = useMemo(() => ({
    soundEnabled: isMusicEnabled,
    volume: volume / 100, // Convert 0-100 to 0-1
  }), [isMusicEnabled, volume]);

  // Sound hooks
  const [playBgMusic, { stop: stopBgMusic }] = useSound(SOUNDS.background, {
    ...musicConfig,
    loop: true
  });
  const [playSpinSound, { stop: stopSpinSound }] = useSound(SOUNDS.spin, {
    ...soundConfig,
    loop: true, // Loop while spinning
  });
  const [playReelStopSound] = useSound(SOUNDS.reelStop, { ...soundConfig, loop: false });
  const [playWinSound] = useSound(SOUNDS.win, soundConfig);
  const [playBigWinSound] = useSound(SOUNDS.bigWin, soundConfig);
  const [playFreeSpinsTriggerSound] = useSound(SOUNDS.featureTrigger, soundConfig);
  const [playClickSound] = useSound(SOUNDS.click, soundConfig);
  const [playFreeSpinsMusic, { stop: stopFreeSpinsMusic }] = useSound(SOUNDS.freeSpinsMusic, {
    ...musicConfig,
    loop: true
  });
  
  // Background music management
  const isFreeSpinsMode = useMemo(() => freeSpinsRemaining > 0, [freeSpinsRemaining]);

  // Notify parent component when free spins state changes
  useEffect(() => {
    if (onFreeSpinsStateChange) {
      onFreeSpinsStateChange(isFreeSpinsMode, featureSymbol);
    }
  }, [isFreeSpinsMode, featureSymbol, onFreeSpinsStateChange]);
  
  useEffect(() => {
    // If music is disabled, stop all music
    if (!isMusicEnabled) {
      stopBgMusic();
      stopFreeSpinsMusic();
      return;
    }

    // If in free spins mode, play the free spins music
    // Otherwise, play the normal background music
    if (isFreeSpinsMode) {
      stopBgMusic();
      playFreeSpinsMusic();
    } else {
      stopFreeSpinsMusic();
      playBgMusic();
    }

    // Cleanup function to stop all music when the component unmounts
    return () => {
      stopBgMusic();
      stopFreeSpinsMusic();
    };
  }, [isFreeSpinsMode, isMusicEnabled, playBgMusic, stopBgMusic, playFreeSpinsMusic, stopFreeSpinsMusic]);
  
  // Autoplay state
  type AutoplaySettings = {
    numberOfSpins: number;
    stopOnAnyWin: boolean;
    stopOnSingleWinExceeds: number;
    stopOnFeature: boolean;
    stopOnTotalLossExceeds: number;
  };
  
  type AutoplayState = {
    isActive: boolean;
    settings: AutoplaySettings | null;
    spinsRemaining: number;
    totalLoss: number;
    originalBalance: number;
  };
  
  const [autoplayState, setAutoplayState] = useState<AutoplayState>({
    isActive: false,
    settings: null,
    spinsRemaining: 0,
    totalLoss: 0,
    originalBalance: 0,
  });
  
  const [showAutoplayDialog, setShowAutoplayDialog] = useState(false);
  const [showFeatureSymbolSelection, setShowFeatureSymbolSelection] = useState(false);
  const [pendingFeatureSymbol, setPendingFeatureSymbol] = useState<string>('');
  const [pendingFreeSpinsCount, setPendingFreeSpinsCount] = useState(0);
  const [winningFeedback, setWinningFeedback] = useState<{
    feedbackText: string;
    winAmount: number;
    animationType: string;
  } | null>(null);

  const isSpinning = useMemo(() => spinningReels.some(s => s), [spinningReels]);
  
  const handleWinAnimationComplete = useCallback(() => {
    setWinningFeedback(null);
  }, []);
  
  const handleWinCountComplete = useCallback((amount: number) => {
    // Called when the count-up animation completes
    // Can be used to update lastWin if needed
  }, []);

  // Handlers for bet and paylines
  const handleIncreaseBet = useCallback(() => {
    if (!config) return;
    playClickSound();
    const currentIndex = config.betAmounts.indexOf(betAmount);
    if (currentIndex === -1) {
      // If betAmount not found, set to first value
      setBetAmount(config.betAmounts[0]);
      return;
    }
    // Circular: if at last index, wrap to first
    const nextIndex = (currentIndex + 1) % config.betAmounts.length;
    setBetAmount(config.betAmounts[nextIndex]);
  }, [betAmount, config, playClickSound]);

  const handleDecreaseBet = useCallback(() => {
    if (!config) return;
    playClickSound();
    const currentIndex = config.betAmounts.indexOf(betAmount);
    if (currentIndex === -1) {
      // If betAmount not found, set to first value
      setBetAmount(config.betAmounts[0]);
      return;
    }
    // Circular: if at first index, wrap to last
    const prevIndex = currentIndex === 0 
      ? config.betAmounts.length - 1 
      : currentIndex - 1;
    setBetAmount(config.betAmounts[prevIndex]);
  }, [betAmount, config, playClickSound]);

  // Paylines are static at 5 - no handlers needed
  const handleIncreasePaylines = useCallback(() => {
    // No-op: paylines are static at 5
  }, []);

  const handleDecreasePaylines = useCallback(() => {
    // No-op: paylines are static at 5
  }, []);

  // Autoplay functions
  const startAutoplay = useCallback((settings: AutoplaySettings) => {
    setAutoplayState({
      isActive: true,
      settings,
      spinsRemaining: settings.numberOfSpins,
      totalLoss: 0,
      originalBalance: balance,
    });
    toast({
      title: "Autoplay Started",
      description: `${settings.numberOfSpins} spins will be executed automatically.`,
    });
  }, [balance, toast]);

  const stopAutoplay = useCallback(() => {
    setAutoplayState({
      isActive: false,
      settings: null,
      spinsRemaining: 0,
      totalLoss: 0,
      originalBalance: 0,
    });
    toast({
      title: "Autoplay Stopped",
      description: "Automatic spinning has been stopped.",
    });
  }, [toast]);

  const checkAutoplayStopConditions = useCallback((spinResult: SpinResult): boolean => {
    if (!autoplayState.isActive || !autoplayState.settings) return false;
    
    const { settings } = autoplayState;
    
    // Stop if any win and setting is enabled
    if (settings.stopOnAnyWin && spinResult.totalWin > 0) {
      return true;
    }
    
    // Stop if single win exceeds threshold
    if (spinResult.totalWin > settings.stopOnSingleWinExceeds) {
      return true;
    }
    
    // Stop on feature (free spins)
    if (settings.stopOnFeature && spinResult.scatterWin.triggeredFreeSpins) {
      return true;
    }
    
    // Stop if total loss exceeds threshold
    const currentLoss = autoplayState.originalBalance - balance;
    if (currentLoss > settings.stopOnTotalLossExceeds) {
      return true;
    }
    
    return false;
  }, [autoplayState, balance]);

  // Initialize game session
  useEffect(() => {
    if (!config) return;
    const initializeGame = async () => {
      try {
        const newSessionId = `session-${Date.now()}`;
        setSessionId(newSessionId);
        // Get initial session state
        try {
          const sessionResponse = await gameApi.getSession(newSessionId);
          // Get balance from session (already in Rands)
          // If balance is 0 or not set, use default of 500
          const balanceFromSession = sessionResponse.player.balance;
          setBalance(balanceFromSession > 0 ? balanceFromSession : 500);
          setFreeSpinsRemaining(sessionResponse.freeSpins);
          setActionGameSpins(sessionResponse.actionGameSpins);
          setFeatureSymbol(sessionResponse.featureSymbol);
        } catch {
          // Session will be created on first spin, balance defaults to 500
          setBalance(500);
        }
      } catch (error) {
        console.error('Failed to initialize game:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to game server. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    initializeGame();
  }, [toast, config]);

  const spin = useCallback(async () => {
    if (isSpinning || !sessionId) return;

    // Check balance on frontend for quick response
    if (balance < totalBet && freeSpinsRemaining === 0 && actionGameSpins === 0) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: "You don't have enough balance to place that bet.",
      });
      return;
    }

    // Start spinning animation
    setLastWin(0);
    setWinningLines([]);
    setBaseGameWinningLines([]);
    setFeatureGameWinningLines([]);
    setShowFeatureGameWins(false);
    setReelsToExpand([]); // Clear expanded reels at start of new spin
    setWinningFeedback(null); // Clear any existing win animation

    // Play spin sound
    stopSpinSound();
    playSpinSound();

    // Asynchronously start reels one by one to ensure staggering
    const startDelay = isTurboMode ? 0 : 10;
    const startReelsSequentially = async () => {
      for (let i = 0; i < numReels; i++) {
        setSpinningReels(prev => {
          const newSpinning = [...prev];
          newSpinning[i] = true;
          return newSpinning;
        });
        await new Promise(resolve => setTimeout(resolve, startDelay));
      }
    };

    startReelsSequentially();
    
    // Track when spinning started for minimum spin duration
    const spinStartTime = Date.now();

    try {
      // Call Backend API directly (bet amounts are in Rands)
      const response: PlayResponse = await gameApi.playGame({
        sessionId: sessionId,
        betAmount: totalBet, // Total bet in Rands
        numPaylines: numPaylines,
        betPerPayline: betPerPayline, // Bet per payline in Rands (totalBet / numPaylines)
        actionGameSpins: actionGameSpins > 0 ? actionGameSpins : undefined,
        gameId: 'BOOK_OF_RA',
      });

      // Grid structure: 5 reels (columns) x 3 rows
      // originalGrid[reelIndex][rowIndex] where:
      // - reelIndex: 0-4 (5 reels/columns from left to right)
      // - rowIndex: 0-2 (3 rows from top to bottom)
      // Example: originalGrid[0][2] = symbol at Reel 0 (leftmost), Row 2 (bottom)
      const originalGrid = response.player.results.grid;
      let finalGrid = originalGrid;
      
      // Identify which reels should expand - use backend's expandedSymbols data
      // The backend tells us which reels should expand based on its win calculation logic
      const reelsToExpandArray: number[] = [];
      if (response.player.results.expandedSymbols && response.player.results.expandedSymbols.length > 0 && response.featureSymbol) {
        // Get unique reel indices from backend's expandedSymbols
        // Backend sends: [{"reel":1,"row":2},{"reel":2,"row":2},...] indicating which reels (columns) should expand
        // Note: reel index in backend matches our column index (0-4 for 5 reels)
        const uniqueReels = new Set(
          response.player.results.expandedSymbols.map((exp: { reel: number; row: number }) => exp.reel)
        );
        reelsToExpandArray.push(...Array.from(uniqueReels));
        
        console.log(`[FREE SPINS] Expansion detected: ${reelsToExpandArray.length} reels to expand:`, reelsToExpandArray);
        console.log(`[FREE SPINS] Feature symbol:`, response.featureSymbol);
        console.log(`[FREE SPINS] Expanded symbols from backend:`, response.player.results.expandedSymbols);
        
        // Create final grid with entire reels (columns) filled with feature symbol
        // When a reel expands, all 3 rows in that column become the feature symbol
        finalGrid = originalGrid.map((reel, reelIndex) => 
          reelsToExpandArray.includes(reelIndex)
            ? Array(numRows).fill(response.featureSymbol)
            : reel
        );
      } else {
        console.log(`[FREE SPINS] No expansion: expandedSymbols=`, response.player.results.expandedSymbols, `featureSymbol=`, response.featureSymbol);
      }
      
      // Store expanded reels for highlighting (set after we have the data)
      setReelsToExpand(reelsToExpandArray);
      
      // Separate base game wins from feature game wins
      const allWinningLines = response.player.results.winningLines as WinningLine[];
      
      // In free spins mode, we need to separate base game and feature game wins
      let baseGameLines: WinningLine[] = [];
      let featureGameLines: WinningLine[] = [];
      
      if (isFreeSpinsMode && response.featureSymbol) {
        // Base game: all wins from winningLines (backend already excludes feature symbol wins)
        // Filter to only include active paylines
        baseGameLines = allWinningLines.filter(line => 
          line.paylineIndex === -1 || line.paylineIndex < numPaylines
        );
        
        // Feature game: use featureGameWinningLines from backend (wins after expansion)
        if (response.player.results.featureGameWinningLines) {
          featureGameLines = (response.player.results.featureGameWinningLines as WinningLine[]).filter(line => 
            line.paylineIndex === -1 || line.paylineIndex < numPaylines
          );
        }
      } else {
        // Normal game: all wins are base game wins
        baseGameLines = allWinningLines.filter(line => 
          line.paylineIndex === -1 || line.paylineIndex < numPaylines
        );
      }
      
      const newWinningLines = baseGameLines;

      // Ensure minimum spin time so animation looks good
      const minSpinTime = isTurboMode ? 200 : 600;
      const elapsedTime = Date.now() - spinStartTime;
      const remainingTime = Math.max(0, minSpinTime - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      // Animate reels stopping one by one
      // IMPORTANT: Keep winning lines cleared during reel stopping to maintain anticipation
      setWinningLines([]);
      setShowFeatureGameWins(false);
      
      const stopBaseDelay = isTurboMode ? 5 : 40;
      const stopIncrementDelay = isTurboMode ? 2 : 20;
      const gridUpdateDelay = isTurboMode ? 2 : 20;
      
      for (let i = 0; i < numReels; i++) {
        await new Promise(resolve => setTimeout(resolve, stopBaseDelay + i * stopIncrementDelay));

        // Update grid with ORIGINAL symbols first (before expansion)
        setGrid(prevGrid => {
          const updatedGrid = [...prevGrid];
          updatedGrid[i] = originalGrid[i];
          return updatedGrid;
        });

        // Small delay to ensure grid update completes
        await new Promise(resolve => setTimeout(resolve, gridUpdateDelay));
        
        // Play reel stop sound
        playReelStopSound();
        
        // Trigger bounce animation for this reel
        setBouncingReels(prev => {
          const newBouncing = [...prev];
          newBouncing[i] = true;
          return newBouncing;
        });
        
        // Reset bounce after animation
        setTimeout(() => {
          setBouncingReels(prev => {
            const newBouncing = [...prev];
            newBouncing[i] = false;
            return newBouncing;
          });
        }, 300);
        
        setSpinningReels(prev => {
          const newSpinning = [...prev];
          newSpinning[i] = false;
          return newSpinning;
        });
      }

      // Stop spin sound when all reels have stopped
      stopSpinSound();

      // Wait a moment after all reels stop to let the grid settle
      await new Promise(resolve => setTimeout(resolve, isTurboMode ? 200 : 500));

      // Show base game wins first (if in free spins mode)
      if (isFreeSpinsMode) {
        // Add scatter win to base game if applicable
        if (response.player.results.scatterWin.triggeredFreeSpins || response.player.results.scatterWin.count > 0) {
          // Only show scatter in base game if feature symbol is NOT scatter
          if (response.featureSymbol !== 'Scatter') {
            const scatterLine: WinningLine = {
              paylineIndex: -1,
              symbol: 'Scatter',
              count: response.player.results.scatterWin.count,
              payout: 0,
              line: [],
            };
            baseGameLines.push(scatterLine);
          }
        }
        
        // PHASE 1: Show base game grid and wins FIRST (if any)
        // Ensure grid is stable and showing original symbols (already set during reel stop)
        // Base game wins should persist until expansion or next spin (like normal game)
        if (baseGameLines.length > 0) {
          setWinningLines(baseGameLines);
          setBaseGameWinningLines(baseGameLines);
          // Base game wins will stay visible until expansion happens or next spin
        } else {
          // Even if no base game wins, wait a bit to show the grid
          await new Promise(resolve => setTimeout(resolve, isTurboMode ? 500 : 1000));
        }
        
        // PHASE 2: Expansion animation
        // Queen, Stone, Leopard, Wolf: expand with 2+ reels
        // Card symbols (10, J, K, Q, A) and all other symbols: expand with 3+ reels
        const expansionThreshold = (response.featureSymbol === 'Queen' || response.featureSymbol === 'Stone' || response.featureSymbol === 'Leopard' || response.featureSymbol === 'Wolf') ? 2 : 3;
        if (reelsToExpandArray.length >= expansionThreshold && response.featureSymbol) {
          // Clear base game wins before expansion (they'll be replaced by feature game wins)
          setWinningLines([]);
          setShowFeatureGameWins(false);
          
          // Wait a moment before expansion starts to build anticipation
          await new Promise(resolve => setTimeout(resolve, isTurboMode ? 500 : 1000));
          
          // Animate expansion for each reel that needs to expand
          for (const reelIndex of reelsToExpandArray) {
            // Mark this reel as expanding
            setExpandingReels(prev => {
              const newExpanding = [...prev];
              newExpanding[reelIndex] = true;
              return newExpanding;
            });
            
            // Wait before updating grid to show expansion animation
            await new Promise(resolve => setTimeout(resolve, isTurboMode ? 100 : 300));
            
            // Update the grid to show expanded symbol for this entire reel
            setGrid(prevGrid => {
              const updatedGrid = prevGrid.map((reel, idx) => 
                idx === reelIndex 
                  ? Array(numRows).fill(response.featureSymbol)
                  : reel
              );
              return updatedGrid;
            });
            
            // Keep expanding state for longer so animation is visible
            await new Promise(resolve => setTimeout(resolve, isTurboMode ? 200 : 400));
            
            // Reset expanding state after animation completes
            setExpandingReels(prev => {
              const newExpanding = [...prev];
              newExpanding[reelIndex] = false;
              return newExpanding;
            });
          }
          
          // Wait after all expansions complete - ensure grid is fully updated and expansion animation is done
          await new Promise(resolve => setTimeout(resolve, isTurboMode ? 500 : 1000));
          
          // PHASE 3: Show feature game wins ONLY AFTER expansion is complete
          // This is when borders and animations should START appearing
          if (featureGameLines.length > 0) {
            // Set the winning lines - this will trigger borders and animations
            setFeatureGameWinningLines(featureGameLines);
            setWinningLines(featureGameLines);
            // Enable feature game wins - this allows borders to show on expanded reels
            setShowFeatureGameWins(true);
            // No delay - winning lines will stay visible until next spin starts
          }
        } else {
          // If no expansion, just ensure we're using the original grid (no changes needed)
          // Grid is already set to originalGrid above
          setShowFeatureGameWins(false);
        }
      } else {
        // Normal game: show all wins including scatter
      if (response.player.results.scatterWin.triggeredFreeSpins) {
        const scatterLine: WinningLine = {
          paylineIndex: -1,
            symbol: 'Scatter',
          count: response.player.results.scatterWin.count,
          payout: 0,
          line: [],
        };
        newWinningLines.push(scatterLine);
      }
      setWinningLines(newWinningLines);
        // Winning lines will stay visible until next spin starts (no delay needed)
      }
      
      // Update state from response (values are already in Rands)
      setBalance(response.player.balance);
      // Use player.freeSpinsRemaining which is the decremented value from backend
      setFreeSpinsRemaining(response.player.freeSpinsRemaining);
      setActionGameSpins(response.player.actionGameSpins);
      setFeatureSymbol(response.player.featureSymbol);
      setLastWin(response.player.lastWin);

      // Show feature symbol selection animation if free spins were triggered (only if NOT already in free spins)
      // When retriggering free spins, the feature symbol doesn't change, so no animation needed
      if (response.player.results.scatterWin.triggeredFreeSpins && response.featureSymbol && !isFreeSpinsMode) {
        playFreeSpinsTriggerSound();
        setPendingFeatureSymbol(response.featureSymbol);
        setPendingFreeSpinsCount(response.freeSpins);
        setShowFeatureSymbolSelection(true);
        // Don't show toast - the animation will handle it
      } else {
        // Show other notifications
      if (response.player.results.actionGameTriggered) {
        toast({
          title: 'Action Game!',
          description: `You won ${response.actionGameSpins} action game spins!`,
        });
      }

      if (response.player.lastWin > 0) {
          // Play win sound - big win for wins > 5x bet, regular win otherwise
          if (response.player.lastWin > totalBet * 5) {
            playBigWinSound();
          } else {
            playWinSound();
          }
          
          // Get winning symbols for the win animation
          const winningSymbols = [...new Set(
            (response.player.results.winningLines || []).map((l: WinningLine) => l.symbol)
          )];
          
          // Generate and show win animation
          const feedback = getWinningFeedback(
            response.player.lastWin,
            winningSymbols,
            totalBet
          );
          setWinningFeedback(feedback);
          
          // Don't show toast - the animation will handle it
        }
      }


      // Return spin result for autoplay logic
      return response.player.results;

    } catch (error) {
      console.error("Failed to fetch spin result:", error);
      stopSpinSound(); // Stop spin sound on error
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to game server",
      });
      setSpinningReels(Array(numReels).fill(false));
      return null;
    }
  }, [isSpinning, balance, totalBet, numPaylines, betPerPayline, freeSpinsRemaining, actionGameSpins, sessionId, isTurboMode, numReels, numRows, toast, betAmount, playSpinSound, stopSpinSound, playReelStopSound, playWinSound, playBigWinSound, playFreeSpinsTriggerSound, getWinningFeedback]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toUpperCase();

      // "S" key - Spin
      if (key === 'S') {
        event.preventDefault();
        if (!isSpinning && sessionId) {
          // Check if button would be disabled
          if (balance >= totalBet || freeSpinsRemaining > 0 || actionGameSpins > 0) {
            spin();
          }
        }
      }

      // "T" key - Toggle Turbo
      if (key === 'T') {
        event.preventDefault();
        setIsTurboMode(prev => !prev);
        playClickSound();
      }

      // "A" key - Auto Spin (show autoplay dialog)
      if (key === 'A') {
        event.preventDefault();
        if (!autoplayState.isActive) {
          setShowAutoplayDialog(true);
        } else {
          // If autoplay is active, stop it
          stopAutoplay();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSpinning, sessionId, balance, totalBet, freeSpinsRemaining, actionGameSpins, spin, playClickSound, autoplayState.isActive, stopAutoplay]);

  // Autoplay effect - handles automatic spinning with stop conditions
  useEffect(() => {
    if (!autoplayState.isActive || !autoplayState.settings) return;
    
    if (autoplayState.spinsRemaining <= 0) {
      stopAutoplay();
      return;
    }
    
    // Stop autoplay if balance is insufficient
    if (balance < totalBet && !isFreeSpinsMode && actionGameSpins === 0) {
      stopAutoplay();
      toast({
        title: "Autoplay Stopped",
        description: "Insufficient balance to continue autoplay.",
      });
      return;
    }
    
    if (!isSpinning && !winningFeedback && balance >= totalBet && !isFreeSpinsMode && actionGameSpins === 0) {
      const timer = setTimeout(() => {
        spin().then((spinResult) => {
          if (spinResult && checkAutoplayStopConditions(spinResult)) {
            stopAutoplay();
            return;
          }
          
          // Decrement spins remaining
          setAutoplayState(prev => ({
            ...prev,
            spinsRemaining: prev.spinsRemaining - 1,
          }));
        });
      }, isTurboMode ? 500 : 1000); // Delay between spins
      
      return () => clearTimeout(timer);
    }
  }, [autoplayState, isSpinning, winningFeedback, balance, totalBet, isFreeSpinsMode, actionGameSpins, isTurboMode, spin, checkAutoplayStopConditions, stopAutoplay, toast]);

  // For spinning reels, show the reel strip for animation (matching original behavior)
  const getReelSymbols = (reelIndex: number): SymbolId[] => {
    if (spinningReels[reelIndex]) {
      // Return the full reel strip for spinning animation
      return reelStrips[reelIndex] || [];
    }
    return grid[reelIndex] || [];
  };

  const getWinningLineIndices = (reelIndex: number, rowIndex: number): number[] => {
    if (winningLines.length === 0) return [];

    // Only show feature game wins AFTER expansion is complete (showFeatureGameWins is true)
    // This ensures borders don't appear before the expansion animation
    // Queen, Stone, Leopard, Wolf: expand with 2+ reels
    // All other symbols: expand with 3+ reels
    const expansionThreshold = (featureSymbol === 'Queen' || featureSymbol === 'Stone' || featureSymbol === 'Leopard' || featureSymbol === 'Wolf') ? 2 : 3;
    const isShowingFeatureGameWins = isFreeSpinsMode && showFeatureGameWins && reelsToExpand.length >= expansionThreshold;
    const gridSymbol = grid[reelIndex]?.[rowIndex];

    return winningLines.reduce((acc, line, lineIndex) => {
      // Only show winning lines for active paylines (0 to numPaylines-1)
      if (line.paylineIndex !== -1) {
        // Regular payline wins
        // Check if this payline is active and matches the position
        if (line.paylineIndex < numPaylines && line.line[reelIndex] === rowIndex) {
          // For feature game wins: only show on expanded reels AND only on the feature symbol
          // For base game wins: show if within the winning count
          if (isShowingFeatureGameWins) {
            // Feature game: only show if:
            // 1. This reel is expanded (must be in reelsToExpand)
            // 2. The symbol at this position is the feature symbol (expanded symbols are all feature symbol)
            // 3. The winning line symbol matches the feature symbol (double-check)
            if (reelsToExpand.includes(reelIndex) && gridSymbol === featureSymbol && line.symbol === featureSymbol) {
              acc.push(line.paylineIndex);
            }
          } else {
            // Base game: show only up to the winning count
            // Scatter symbols acting as wilds are already included in the winning line from backend
            if (reelIndex < line.count) {
        acc.push(line.paylineIndex);
      }
          }
        }
      } else if (line.paylineIndex === -1) {
        // Scatter wins: only highlight if count >= 3 (actual scatter win)
        // 1-2 scatters don't win anything, so don't highlight them
        if (line.count >= 3 && gridSymbol === line.symbol) {
          acc.push(10); // Special index for scatter
        }
      }
      return acc;
    }, [] as number[]);
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full h-full min-h-0">
        <div className="flex flex-col items-center justify-center flex-1 w-full min-h-0 overflow-hidden">
          <div className={`flex flex-col items-center gap-2 p-3 rounded-2xl bg-card/50 border-2 md:border-4 shadow-2xl w-full h-full relative flex-1 min-h-0 ${
            isFreeSpinsMode
              ? 'border-yellow-400'
              : 'border-primary/50'
          }`}>
            <div className="relative w-full h-full flex justify-center items-center">
              <PaylineNumbers 
                winningLines={winningLines} 
                isSpinning={isSpinning}
                numPaylines={numPaylines}
              >
                <div 
                  className="grid gap-0 p-0 bg-black/30 rounded-lg relative w-full h-full"
                  style={{ 
                    gridTemplateColumns: `repeat(${numReels}, minmax(0, 1fr))`,
                    maxWidth: '1296px',
                    margin: '0 auto'
                  }}
                >
                  {config && numReels > 0 && Array.from({ length: numReels }).map((_, i) => (
                    <ReelColumn
                      key={i}
                      symbols={getReelSymbols(i)}
                      isSpinning={spinningReels[i]}
                      reelIndex={i}
                      winningLineIndicesForColumn={
                        Array(numRows).fill(0).map((_, j) => getWinningLineIndices(i, j))
                      }
                      isTurboMode={isTurboMode}
                      shouldBounce={bouncingReels[i]}
                      isExpanding={expandingReels[i]}
                      isExpanded={showFeatureGameWins && reelsToExpand.includes(i)} // Only show yellow border when winning lines are displayed
                    />
                  ))}
                  
                  {!isSpinning && winningLines.length > 0 && (
                    <WinningLinesDisplay 
                      winningLines={winningLines.filter(l => l.paylineIndex !== -1)} 
                    />
                  )}
                </div>
              </PaylineNumbers>
            </div>
          </div>
        </div>

        {/* Control Panel - positioned at bottom */}
        <div className="w-full flex-shrink-0 mt-2">
        <ControlPanel
        betPerPayline={betPerPayline}
        numPaylines={numPaylines}
        totalBet={totalBet}
        balance={balance}
        lastWin={lastWin}
        isSpinning={isSpinning}
        onSpin={spin}
        onIncreaseBet={handleIncreaseBet}
        onDecreaseBet={handleDecreaseBet}
        onIncreasePaylines={handleIncreasePaylines}
        onDecreasePaylines={handleDecreasePaylines}
        freeSpinsRemaining={freeSpinsRemaining}
        isFreeSpinsMode={isFreeSpinsMode}
        actionGameSpins={actionGameSpins}
        isTurboMode={isTurboMode}
        onToggleTurbo={() => setIsTurboMode(!isTurboMode)}
        isMusicEnabled={isMusicEnabled}
        onToggleMusic={() => setIsMusicEnabled(!isMusicEnabled)}
        isSfxEnabled={isSfxEnabled}
        onToggleSfx={() => setIsSfxEnabled(!isSfxEnabled)}
        volume={volume}
        onVolumeChange={setVolume}
        maxPaylines={config?.maxPaylines || 5}
        featureSymbol={featureSymbol}
        autoplayState={autoplayState}
        onStartAutoplay={startAutoplay}
        onStopAutoplay={stopAutoplay}
        onShowAutoplayDialog={() => setShowAutoplayDialog(true)}
        />
        </div>
      </div>

      {/* Autoplay Dialog */}
      <AutoplayDialog
        isOpen={showAutoplayDialog}
        onClose={() => setShowAutoplayDialog(false)}
        onStartAutoplay={startAutoplay}
        currentBalance={balance}
        currentBet={betAmount}
      />

      {/* Feature Symbol Selection Animation */}
      <FeatureSymbolSelection
        isOpen={showFeatureSymbolSelection}
        onComplete={() => {
          setShowFeatureSymbolSelection(false);
          setPendingFeatureSymbol('');
          setPendingFreeSpinsCount(0);
        }}
        selectedSymbol={pendingFeatureSymbol}
        freeSpinsCount={pendingFreeSpinsCount}
      />

      {/* Win Animation */}
      {winningFeedback && (
        <WinAnimation
          feedback={winningFeedback}
          onAnimationComplete={handleWinAnimationComplete}
          onCountComplete={handleWinCountComplete}
        />
      )}
    </>
  );
}
