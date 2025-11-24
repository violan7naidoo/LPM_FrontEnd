/**
 * Dev Mode Hook
 * 
 * Provides developer mode functionality with keyboard shortcuts for testing.
 * Only works in development environment (NODE_ENV === 'development').
 * 
 * Features:
 * - Toggle dev mode with Ctrl+D
 * - Keyboard shortcuts for testing features
 * - Dev mode state management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface DevModeShortcuts {
  onTriggerPennyGames: () => void;
  onTriggerActionGames: () => void;
  onForceBigWin: () => void;
  onAddBalance: () => void;
  onTriggerMysteryPrize: () => void;
  onResetSession: () => void;
}

export function useDevMode(shortcuts: DevModeShortcuts) {
  const [isDevModeActive, setIsDevModeActive] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Toggle dev mode with Ctrl+D
  useEffect(() => {
    if (!isDevelopment) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+D or Cmd+D to toggle dev mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        setIsDevModeActive(prev => {
          const newState = !prev;
          console.log(`[DEV MODE] ${newState ? 'ACTIVATED' : 'DEACTIVATED'}`);
          return newState;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDevelopment]);

  // Handle keyboard shortcuts when dev mode is active
  useEffect(() => {
    if (!isDevelopment || !isDevModeActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'p':
          // Only trigger if Ctrl/Cmd is NOT pressed (let Ctrl+P pass through for browser print)
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            console.log('[DEV MODE] Triggering Penny Games (Free Spins)');
            shortcuts.onTriggerPennyGames();
          }
          break;
        case 'a':
          // Ctrl+A or Cmd+A triggers Action Games in dev mode
          // Regular A key is handled by SlotMachine for autoplay
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            console.log('[DEV MODE] Triggering Action Games');
            shortcuts.onTriggerActionGames();
          }
          // Let regular A key pass through for autoplay
          break;
        case 'w':
          // Only trigger if Ctrl/Cmd is NOT pressed
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            console.log('[DEV MODE] Forcing Big Win');
            shortcuts.onForceBigWin();
          }
          break;
        case 'b':
          // Only trigger if Ctrl/Cmd is NOT pressed
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            console.log('[DEV MODE] Adding Balance');
            shortcuts.onAddBalance();
          }
          break;
        case 'm':
          // Only trigger if Ctrl/Cmd is NOT pressed
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            console.log('[DEV MODE] Triggering Mystery Prize');
            shortcuts.onTriggerMysteryPrize();
          }
          break;
        case 'r':
          // Only trigger if Ctrl/Cmd is NOT pressed
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            console.log('[DEV MODE] Resetting Session');
            shortcuts.onResetSession();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDevModeActive, shortcuts, isDevelopment]);

  return {
    isDevModeActive: isDevelopment ? isDevModeActive : false,
    isDevelopment,
  };
}

