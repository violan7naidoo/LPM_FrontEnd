/**
 * Dev Mode Panel Component
 * 
 * Displays developer mode status and available keyboard shortcuts.
 * Only visible in development environment when dev mode is active.
 */

'use client';

interface DevModePanelProps {
  isActive: boolean;
}

export function DevModePanel({ isActive }: DevModePanelProps) {
  if (!isActive || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="absolute top-2 right-2 z-50 bg-black/90 border-2 border-yellow-500 rounded-lg p-4 text-white text-sm font-mono max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-yellow-400 font-bold text-base">DEV MODE ACTIVE</h3>
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="border-b border-gray-700 pb-2 mb-2">
          <div className="text-yellow-400 font-semibold mb-1">Keyboard Shortcuts:</div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-300">P</span>
            <span className="text-white">Trigger Penny Games</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">A</span>
            <span className="text-white">Autoplay (normal)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Ctrl+A</span>
            <span className="text-white">Trigger Action Games</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">W</span>
            <span className="text-white">Force Big Win</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">B</span>
            <span className="text-white">Add Balance (+R100)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">M</span>
            <span className="text-white">Trigger Mystery Prize</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">R</span>
            <span className="text-white">Reset Session</span>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-2 mt-2">
          <div className="text-yellow-400 text-xs">
            Press <kbd className="bg-gray-800 px-1 rounded">Ctrl+D</kbd> to toggle
          </div>
        </div>
      </div>
    </div>
  );
}

