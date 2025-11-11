import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PayTableDialog } from "./pay-table-dialog";
import { InfoDialog } from "./info-dialog";
import { AudioSettingsDialog } from "./audio-settings-dialog";
import { Plus, Minus, RotateCw } from "lucide-react";
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useGameConfig } from '@/hooks/use-game-config';

interface ControlPanelProps {
  betPerPayline: number;
  numPaylines: number;
  totalBet: number;
  balance: number;
  lastWin: number;
  isSpinning: boolean;
  onSpin: () => void;
  onIncreaseBet: () => void;
  onDecreaseBet: () => void;
  onIncreasePaylines: () => void;
  onDecreasePaylines: () => void;
  freeSpinsRemaining: number;
  isFreeSpinsMode: boolean;
  actionGameSpins: number;
  isTurboMode: boolean;
  onToggleTurbo: () => void;
  isMusicEnabled: boolean;
  onToggleMusic: () => void;
  isSfxEnabled: boolean;
  onToggleSfx: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  maxPaylines: number;
  featureSymbol?: string;
  autoplayState?: {
    isActive: boolean;
    settings: any;
    spinsRemaining: number;
    totalLoss: number;
    originalBalance: number;
  };
  onStartAutoplay?: (settings: any) => void;
  onStopAutoplay?: () => void;
  onShowAutoplayDialog?: () => void;
}

const InfoDisplay = ({ label, value, isCurrency = true }: { label: string; value: number | string; isCurrency?: boolean }) => (
    <div className="flex flex-col items-center justify-center p-1 rounded-md text-center min-h-[48px] sm:min-h-[60px] md:min-h-[80px] info-display-bg flex-1 min-w-[120px]">
        <span className="text-[10px] sm:text-[12px] md:text-[14px] uppercase font-mono tracking-widest subtle-cyan-text">{label}</span>
        <span className="text-base sm:text-lg md:text-xl font-bold font-mono cyan-text-glow">
            {isCurrency ? `R ${value}` : value}
        </span>
    </div>
);

// Mobile-specific InfoDisplay with full width
const MobileInfoDisplay = ({ label, value, isCurrency = true }: { label: string; value: number | string; isCurrency?: boolean }) => (
    <div className="flex flex-col items-center justify-center p-1 rounded-md w-full text-center min-h-[48px] info-display-bg">
        <span className="text-[10px] uppercase font-mono tracking-widest subtle-cyan-text">{label}</span>
        <span className="text-base font-bold font-mono cyan-text-glow">
            {isCurrency ? `R ${value}` : value}
        </span>
    </div>
);

export function ControlPanel({
  betPerPayline,
  numPaylines,
  totalBet,
  balance,
  lastWin,
  isSpinning,
  onSpin,
  onIncreaseBet,
  onDecreaseBet,
  onIncreasePaylines,
  onDecreasePaylines,
  freeSpinsRemaining,
  isFreeSpinsMode,
  actionGameSpins,
  isTurboMode,
  onToggleTurbo,
  isMusicEnabled,
  onToggleMusic,
  isSfxEnabled,
  onToggleSfx,
  volume,
  onVolumeChange,
  maxPaylines,
  featureSymbol,
  autoplayState,
  onStartAutoplay,
  onStopAutoplay,
  onShowAutoplayDialog,
}: ControlPanelProps) {
  const { config } = useGameConfig();
  
  // Get feature symbol image if available
  const featureSymbolImage = useMemo(() => {
    if (!featureSymbol || !config?.symbols) return null;
    const symbol = config.symbols[featureSymbol as keyof typeof config.symbols];
    return symbol?.image || null;
  }, [featureSymbol, config]);

    const spinButtonText = useMemo(() => {
        if (isSpinning) return 'SPINNING';
        if (isFreeSpinsMode) return 'FREE SPIN';
        if (actionGameSpins > 0) return 'ACTION SPIN';
        return 'SPIN';
    }, [isSpinning, isFreeSpinsMode, actionGameSpins]);
    
    const spinButtonTextStyle = useMemo(() => {
        if (spinButtonText === 'FREE SPIN' || spinButtonText === 'ACTION SPIN') {
            return 'text-sm sm:text-base md:text-lg';
        }
        return 'text-lg sm:text-xl md:text-2xl';
    }, [spinButtonText]);

  const isButtonDisabled = isSpinning || (balance < totalBet && !isFreeSpinsMode && actionGameSpins === 0);

  return (
    <Card className="w-full sm:w-[125%] sm:-mx-[12.5%] p-2 md:p-4 shadow-2xl control-panel-card sm:backdrop-blur">
        {/* Desktop layout - single horizontal line */}
        <div className="hidden sm:flex items-center justify-between gap-2">
            {/* Balance */}
            <InfoDisplay label="Balance" value={balance.toFixed(2)} />
            
            {/* Bet Amount */}
            {!isFreeSpinsMode && (
                <div className="flex flex-col items-center justify-center p-1 rounded-md text-center min-h-[60px] md:min-h-[80px] info-display-bg flex-1 min-w-[120px]">
                    <span className="text-[10px] sm:text-[12px] md:text-[14px] uppercase font-mono tracking-widest subtle-cyan-text">Bet</span>
                    <div className="flex items-center gap-0.5 justify-center w-full mt-0.5">
                        <Button variant="ghost" size="icon" className="h-6 w-6 md:h-8 md:w-8 hover:text-cyan-200 bet-button-icon" onClick={onDecreaseBet} disabled={isSpinning}>
                            <Minus className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                        <span className="text-base md:text-lg font-bold font-mono px-1 cyan-text-glow">
                            R {betPerPayline.toFixed(2)}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 md:h-8 md:w-8 hover:text-cyan-200 bet-button-icon" onClick={onIncreaseBet} disabled={isSpinning}>
                            <Plus className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                    </div>
                </div>
            )}
            {isFreeSpinsMode && (
                <>
                    <InfoDisplay label="Free Spins" value={freeSpinsRemaining} isCurrency={false} />
                    {featureSymbol && (
                        <div className="flex flex-col items-center justify-center p-1 rounded-md text-center min-h-[60px] md:min-h-[80px] info-display-bg flex-1 min-w-[120px]">
                            <span className="text-[10px] sm:text-[12px] md:text-[14px] uppercase font-mono tracking-widest subtle-cyan-text">Expanding Symbol</span>
                            <div className="relative w-12 h-12 md:w-16 md:h-16 mt-1">
                                {featureSymbolImage ? (
                                    <Image
                                        src={featureSymbolImage}
                                        alt={featureSymbol}
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                        {featureSymbol}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
            {actionGameSpins > 0 && !isFreeSpinsMode && (
                <InfoDisplay label="Action Spins" value={actionGameSpins} isCurrency={false} />
            )}

            {/* TURBO Button */}
            <Button
                onClick={onToggleTurbo}
                className={`
                    relative w-14 h-14 md:w-20 md:h-20 rounded-full
                    flex items-center justify-center p-0
                    text-white transition-all duration-300 ease-in-out
                    shadow-xl transform active:scale-95
                    ${isTurboMode 
                        ? 'opacity-80' 
                        : 'hover:scale-105'
                    }
                `}
            >
                <Image
                    src="/Control_Panel/turbo.png"
                    alt="Turbo Button"
                    fill
                    className="object-cover rounded-full"
                    unoptimized
                />
            </Button>
            
            {/* SPIN Button */}
            <Button
                onClick={onSpin}
                disabled={isButtonDisabled}
                className={`
                    relative w-20 h-20 md:w-28 md:h-28 rounded-full
                    flex items-center justify-center p-0
                    transition-all duration-300 ease-in-out
                    shadow-xl transform active:scale-95
                    ${isButtonDisabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:scale-105'
                    }
                `}
            >
                {isSpinning ? (
                    <RotateCw className="w-12 h-12 md:w-16 md:h-16 animate-spin-slow text-white absolute z-10" />
                ) : (
                    <Image
                        src="/Control_Panel/spin_btn.png"
                        alt="Spin Button"
                        fill
                        className="object-cover rounded-full"
                        unoptimized
                    />
                )}
            </Button>

            {/* AUTO SPIN Button */}
            {autoplayState && (
                <Button
                    onClick={autoplayState.isActive ? onStopAutoplay : onShowAutoplayDialog}
                    className={`
                        relative w-14 h-14 md:w-20 md:h-20 rounded-full
                        flex items-center justify-center p-0
                        text-white transition-all duration-300 ease-in-out
                        shadow-xl transform active:scale-95
                        ${autoplayState.isActive 
                            ? 'opacity-80' 
                            : 'hover:scale-105'
                        }
                    `}
                >
                    <Image
                        src="/Control_Panel/auto_spin.png"
                        alt="Auto Spin Button"
                        fill
                        className="object-cover rounded-full"
                        unoptimized
                    />
                </Button>
            )}

            {/* Win */}
            <InfoDisplay label="Win" value={lastWin.toFixed(2)} />
        
            {/* Pay Table, Info, and Audio Settings */}
            <div className="flex items-center justify-center gap-2 p-1 rounded-md text-center min-h-[60px] md:min-h-[80px] info-display-bg flex-1 min-w-[120px]">
                <PayTableDialog betPerPayline={betPerPayline} totalBet={totalBet} />
                <InfoDialog />
                <AudioSettingsDialog 
                  isMusicEnabled={isMusicEnabled}
                  onToggleMusic={onToggleMusic}
                  isSfxEnabled={isSfxEnabled}
                  onToggleSfx={onToggleSfx}
                  volume={volume}
                  onVolumeChange={onVolumeChange}
                />
            </div>
        </div>

        {/* Mobile layout */}
        <div className="sm:hidden space-y-2 mt-2">
            {/* Top row: Action buttons */}
            <div className="flex items-center justify-center gap-3">
                {/* TURBO Button */}
                <Button
                    onClick={onToggleTurbo}
                    className={`
                        relative w-12 h-12 rounded-full
                        flex items-center justify-center p-0
                        text-white transition-all duration-300 ease-in-out
                        shadow-xl transform active:scale-95
                        ${isTurboMode 
                            ? 'opacity-80' 
                            : 'hover:scale-105'
                        }
                    `}
                >
                    <Image
                        src="/Control_Panel/turbo.png"
                        alt="Turbo Button"
                        fill
                        className="object-cover rounded-full"
                        unoptimized
                    />
                </Button>
                
                {/* SPIN Button */}
                <Button
                    onClick={onSpin}
                    disabled={isButtonDisabled}
                    className={`
                        relative w-16 h-16 rounded-full
                        flex items-center justify-center p-0
                        transition-all duration-300 ease-in-out
                        shadow-xl transform active:scale-95
                        ${isButtonDisabled 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:scale-105'
                        }
                    `}
                >
                    {isSpinning ? (
                        <RotateCw className="w-8 h-8 animate-spin-slow text-white absolute z-10" />
                    ) : (
                        <Image
                            src="/Control_Panel/spin_btn.png"
                            alt="Spin Button"
                            fill
                            className="object-cover rounded-full"
                            unoptimized
                        />
                    )}
                </Button>
                
                {/* AUTO SPIN Button */}
                {autoplayState && (
                    <Button
                        onClick={autoplayState.isActive ? onStopAutoplay : onShowAutoplayDialog}
                        className={`
                            relative w-12 h-12 rounded-full
                            flex items-center justify-center p-0
                            text-white transition-all duration-300 ease-in-out
                            shadow-xl transform active:scale-95
                            ${autoplayState.isActive 
                                ? 'opacity-80' 
                                : 'hover:scale-105'
                            }
                        `}
                    >
                        <Image
                            src="/Control_Panel/auto_spin.png"
                            alt="Auto Spin Button"
                            fill
                            className="object-cover rounded-full"
                            unoptimized
                        />
                    </Button>
                )}
            </div>

            {/* Middle row: Win, Bet */}
            <div className="flex gap-2">
                <div className="flex-1">
                    <MobileInfoDisplay label="Win" value={lastWin.toFixed(2)} />
                </div>
                {!isFreeSpinsMode && (
                    <>
                        <div className="flex-1">
                            <div className="flex flex-col items-center justify-center p-1 rounded-md text-center min-h-[48px] info-display-bg">
                                <span className="text-[8px] uppercase font-mono tracking-widest subtle-cyan-text">Bet</span>
                                <div className="flex items-center gap-0.5 justify-center w-full mt-0.5">
                                    <Button variant="ghost" size="icon" className="h-4 w-4 hover:text-cyan-200 bet-button-icon" onClick={onDecreaseBet} disabled={isSpinning}>
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="text-sm font-bold font-mono px-1 cyan-text-glow">
                                        R {betPerPayline.toFixed(2)}
                                    </span>
                                    <Button variant="ghost" size="icon" className="h-4 w-4 hover:text-cyan-200 bet-button-icon" onClick={onIncreaseBet} disabled={isSpinning}>
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {isFreeSpinsMode && (
                    <>
                        <div className="flex-1">
                            <MobileInfoDisplay label="Free Spins" value={freeSpinsRemaining} isCurrency={false} />
                        </div>
                        {featureSymbol && (
                            <div className="flex-1">
                                <div className="flex flex-col items-center justify-center p-1 rounded-md text-center min-h-[48px] info-display-bg">
                                    <span className="text-[8px] uppercase font-mono tracking-widest subtle-cyan-text">Expanding</span>
                                    <div className="relative w-8 h-8 mt-0.5">
                                        {featureSymbolImage ? (
                                            <Image
                                                src={featureSymbolImage}
                                                alt={featureSymbol}
                                                fill
                                                className="object-contain"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white text-[8px] font-bold">
                                                {featureSymbol}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                {actionGameSpins > 0 && !isFreeSpinsMode && (
                    <div className="flex-1">
                        <MobileInfoDisplay label="Action Spins" value={actionGameSpins} isCurrency={false} />
                    </div>
                )}
            </div>

            {/* Bottom row: Balance and Pay Table/Music */}
            <div className="flex gap-2">
                <div className="flex-1">
                    <MobileInfoDisplay label="Balance" value={balance.toFixed(2)} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-center gap-2 p-1 rounded-md text-center min-h-[48px] info-display-bg">
                    <PayTableDialog betPerPayline={betPerPayline} totalBet={totalBet} />
                    <InfoDialog />
                    <AudioSettingsDialog 
                      isMusicEnabled={isMusicEnabled}
                      onToggleMusic={onToggleMusic}
                      isSfxEnabled={isSfxEnabled}
                      onToggleSfx={onToggleSfx}
                      volume={volume}
                      onVolumeChange={onVolumeChange}
                    />
                    </div>
                </div>
            </div>
        </div>
    </Card>
  );
}

