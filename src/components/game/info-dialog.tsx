/**
 * InfoDialog Component
 * 
 * This component displays game rules and information in a modal dialog.
 * It provides players with instructions on how to play the game.
 * 
 * Features:
 * - Game information (name, RTP, bet limits)
 * - How to Play section
 * - Special Features explanation
 * - Paylines information
 * - Turbo Mode explanation
 * - Responsible Gaming guidelines
 * 
 * Layout:
 * - Modal dialog with scrollable content
 * - Responsive sizing (95vw width, 90vh height)
 * - Sections organized in cards with borders
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { useGameConfig } from '@/hooks/use-game-config';

export function InfoDialog() {
  const { config } = useGameConfig();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 p-1 bg-black/30 hover:bg-black/50 transition-colors">
          <Info className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] bg-background/95 backdrop-blur-sm p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-4 pt-4 sm:px-6 flex-shrink-0">
          <DialogTitle className="font-headline text-accent text-xl sm:text-3xl">Game Rules</DialogTitle>
        </DialogHeader>
        
        {/* Game Information Section */}
        <div className="px-4 pb-4 border-b border-muted-foreground/10">
          <h2 className="font-headline text-white text-2xl sm:text-3xl mb-3">{config?.gameName || 'Frosty Fortunes'}</h2>
          <div className="space-y-1 text-sm sm:text-base text-white">
            <p>{config?.gameName || 'Frosty Fortunes'} is a {config?.numReels || 5}x{config?.numRows || 3} slot game with {config?.maxPaylines || 10} paylines.</p>
            <p>The RTP-rate (return-to-player) is 96.00%.</p>
            <p>Minimum bet: R {config?.betAmounts?.[0]?.toFixed(2) || '0.20'}</p>
            <p>Maximum bet: R {config?.betAmounts?.[config?.betAmounts.length - 1]?.toFixed(2) || '5.00'}</p>
          </div>
        </div>
        
        {/* Combined Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Game Rules Section */}
          <div className="mb-6">
            <h3 className="font-headline text-lg sm:text-2xl text-accent mb-3 sm:mb-4">How to Play</h3>
            
            <div className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <div className="p-4 bg-card/30 border border-muted-foreground/20 rounded-lg">
                <h4 className="font-bold text-white mb-2">Basic Gameplay</h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Select your bet per payline using the + and - buttons</li>
                  <li>Choose the number of paylines (1 to {config?.maxPaylines || 10})</li>
                  <li>Click the SPIN button to start the reels</li>
                  <li>Wins are awarded for matching symbols on active paylines</li>
                  <li>Symbols must appear from left to right on a payline</li>
                </ul>
              </div>

              <div className="p-4 bg-card/30 border border-muted-foreground/20 rounded-lg">
                <h4 className="font-bold text-white mb-2">Special Features</h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Book Symbol:</strong> Acts as both wild and scatter. Substitutes for other symbols and triggers free spins when 3+ appear</li>
                  <li><strong>Free Spins:</strong> Landing 3+ Book symbols awards {config?.freeSpinsAwarded || 10} free spins with an expanding symbol</li>
                  <li><strong>Expanding Symbol:</strong> During free spins, one symbol is randomly selected to expand and cover entire reels</li>
                  <li><strong>Action Game:</strong> Triggered by 5 {config?.actionGameTriggers ? Object.values(config.actionGameTriggers)[0]?.symbol : 'ARCHAEOLOGIST'} symbols</li>
                </ul>
              </div>

              <div className="p-4 bg-card/30 border border-muted-foreground/20 rounded-lg">
                <h4 className="font-bold text-white mb-2">Paylines</h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li>You can select 1 to {config?.maxPaylines || 10} paylines</li>
                  <li>Paylines run from left to right across the reels</li>
                  <li>Wins are awarded for 3 or more matching symbols</li>
                  <li>Higher symbol counts award bigger payouts</li>
                  <li>Total bet = Number of Paylines × Bet Per Payline</li>
                </ul>
              </div>

              <div className="p-4 bg-card/30 border border-muted-foreground/20 rounded-lg">
                <h4 className="font-bold text-white mb-2">Turbo Mode</h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Enable TURBO for faster reel spinning</li>
                  <li>Reduces animation time for quicker gameplay</li>
                  <li>All game mechanics remain the same</li>
                </ul>
              </div>

              <div className="p-4 bg-card/30 border border-muted-foreground/20 rounded-lg">
                <h4 className="font-bold text-white mb-2">Responsible Gaming</h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Set time and money limits before playing</li>
                  <li>Never chase losses</li>
                  <li>Take regular breaks from gaming</li>
                  <li>Gaming should be fun, not a way to make money</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

