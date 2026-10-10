import React from 'react';
import { Sun, Moon, Copy, Check } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useState } from 'react';

export const Header = ({ onMenuToggle, room }) => {
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(room.roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {}
  };

  return (
    <header className="h-14 bg-canvas-black border-b border-surface-border flex items-center justify-between px-4 md:px-6 shrink-0 relative z-50">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 md:gap-3">
          <img src="/nav.png" alt="Logo" className="h-8 w-8 object-contain" />
          <h1 className="text-heading-lg text-text-primary tracking-tight text-lg md:text-xl pt-0.5 font-bold">
            HandoffHub
          </h1>
        </div>

        {/* Project name */}
        {room?.roomName && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-surface-border text-lg select-none">/</span>
            <span className="text-text-secondary text-sm truncate max-w-[140px]">
              {room.roomName}
            </span>
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Project ID */}
        <button
          type="button"
          onClick={handleCopy}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-button border border-surface-border text-xs text-text-secondary hover:text-text-primary hover:border-brand-mint/50 transition-colors"
          title="Copy project ID"
        >
          <span className="font-mono text-xs">{room?.roomId}</span>
          {copied ? (
            <Check className="w-3.5 h-3.5 text-brand-mint" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="text-text-muted hover:text-brand-mint transition-colors p-1.5 rounded-lg hover:bg-surface-elevated"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
