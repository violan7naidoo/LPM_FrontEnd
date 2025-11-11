import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Volume2 } from 'lucide-react';

interface AudioSettingsDialogProps {
  isMusicEnabled: boolean;
  onToggleMusic: () => void;
  isSfxEnabled: boolean;
  onToggleSfx: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export function AudioSettingsDialog({
  isMusicEnabled,
  onToggleMusic,
  isSfxEnabled,
  onToggleSfx,
  volume,
  onVolumeChange,
}: AudioSettingsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 p-1 bg-black/30 hover:bg-black/50 transition-colors">
          <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md h-auto bg-background/95 backdrop-blur-sm p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-4 pt-4 sm:px-6 flex-shrink-0">
          <DialogTitle className="font-headline text-accent text-xl sm:text-2xl">Audio Settings</DialogTitle>
        </DialogHeader>
        
        {/* Audio Controls */}
        <div className="px-4 pb-6 flex-1 flex flex-col space-y-6">
          {/* Volume Control */}
          <div className="space-y-3">
            <h3 className="font-headline text-white text-lg">Volume</h3>
            <div className="space-y-2">
              <Slider
                value={[volume]}
                onValueChange={(value) => onVolumeChange(value[0])}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0</span>
                <span className="font-bold text-accent">{volume}</span>
                <span>100</span>
              </div>
            </div>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between p-4 bg-card/30 border border-muted-foreground/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="music-enabled"
                checked={isMusicEnabled}
                onCheckedChange={onToggleMusic}
                className="w-5 h-5"
              />
              <label htmlFor="music-enabled" className="text-white font-medium">
                Music Enabled
              </label>
            </div>
          </div>

          {/* SFX Toggle */}
          <div className="flex items-center justify-between p-4 bg-card/30 border border-muted-foreground/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="sfx-enabled"
                checked={isSfxEnabled}
                onCheckedChange={onToggleSfx}
                className="w-5 h-5"
              />
              <label htmlFor="sfx-enabled" className="text-white font-medium">
                SFX Enabled
              </label>
            </div>
          </div>

          {/* SFX Explanation */}
          <div className="p-3 bg-card/20 border border-muted-foreground/10 rounded-lg">
            <p className="text-xs text-muted-foreground">
              SFX includes reel spinning, win sounds, scatter effects, button clicks, and all game sound effects.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

