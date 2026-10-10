import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const LandingNavbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-canvas-black/80 backdrop-blur-md border-b border-surface-border py-3 shadow-sm'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 md:gap-3">
          <div className="h-10 w-10 rounded-lg bg-brand-mint flex items-center justify-center">
            <img src="/nav.png" alt="HandoffHub" />
          </div>
          <span className="text-text-primary text-xl md:text-2xl font-bold tracking-tight">
            HandoffHub
          </span>
        </Link>

        {/* Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <a href="#features" className="text-body text-text-secondary hover:text-text-primary transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-body text-text-secondary hover:text-text-primary transition-colors">
            How It Works
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="text-text-muted hover:text-brand-mint transition-colors p-2 rounded-full hover:bg-surface-elevated"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <Link
            to="/join"
            className="hidden sm:block text-text-secondary hover:text-text-primary px-4 py-2.5 rounded-button font-mono text-xs uppercase tracking-wider transition-colors"
          >
            Join Project
          </Link>

          <Link
            to="/create"
            className="bg-text-primary text-canvas-black px-5 py-2.5 rounded-button font-mono text-xs uppercase tracking-wider hover:bg-brand-mint transition-colors"
          >
            New Project
          </Link>
        </div>
      </div>
    </nav>
  );
};