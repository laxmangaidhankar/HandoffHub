import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Plus,
  LogIn,
  CheckCircle2,
  Milestone,
  ShieldCheck,
} from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-canvas-black">

      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--surface-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--surface-border)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — Hero content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-6"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-mint/10 border border-brand-mint/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-brand-mint animate-pulse" />
              <span className="text-mono text-[10px] text-brand-mint uppercase tracking-wider">
                DEVELOPER × CLIENT • PROJECT HANDOFF
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-display text-text-primary text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
              Deliver Projects.
              <br />
              <span className="text-brand-mint">
                Complete the Handoff.
              </span>
            </h1>

            {/* Description */}
            <p className="text-body text-text-secondary text-lg md:text-xl max-w-xl">
              A dedicated space where developer and client coordinate deliverables,
              review milestones, share credentials, and complete the final handoff —
              all in one place.
            </p>

            {/* Product highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              <div className="flex items-center gap-2 p-3 bg-surface-slate/40 border border-surface-border/60 rounded-xl">
                <Milestone className="w-5 h-5 text-brand-mint shrink-0" />
                <span className="text-mono text-xs text-text-secondary">Milestones</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-surface-slate/40 border border-surface-border/60 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-brand-mint shrink-0" />
                <span className="text-mono text-xs text-text-secondary">Reviews</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-surface-slate/40 border border-surface-border/60 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-brand-mint shrink-0" />
                <span className="text-mono text-xs text-text-secondary">Encrypted Handoff</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <Link
                to="/create"
                className="flex items-center gap-2 bg-brand-mint text-canvas-black px-6 py-3.5 rounded-button font-mono text-sm uppercase tracking-wider hover:bg-text-primary transition-colors"
              >
                <Plus className="w-4 h-4" />
                Start a Project
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/join"
                className="flex items-center gap-2 bg-surface-slate border border-surface-border text-text-primary px-6 py-3.5 rounded-button font-mono text-sm uppercase tracking-wider hover:bg-surface-elevated transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Join Project
              </Link>
            </div>
          </motion.div>

          {/* Right — Project card visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative"
          >
            <div className="relative rounded-3xl border border-surface-border bg-surface-slate/70 backdrop-blur-sm p-6 md:p-8 shadow-[0_0_60px_-20px_rgba(60,255,208,0.25)]">

              {/* Window header */}
              <div className="flex items-center justify-between pb-5 border-b border-surface-border">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-mint animate-pulse" />
                  <span className="text-mono text-xs text-text-secondary uppercase">
                    E-Commerce Platform
                  </span>
                </div>
                <span className="text-mono text-xs px-2 py-0.5 rounded-full bg-brand-mint/10 text-brand-mint border border-brand-mint/20">
                  ACTIVE
                </span>
              </div>

              {/* Milestones */}
              <div className="py-5 space-y-3">
                {[
                  { label: 'Requirements Confirmed', done: true },
                  { label: 'Design Review', done: true },
                  { label: 'Backend API Delivery', done: false },
                  { label: 'Final Handoff', done: false },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-3 p-3 bg-canvas-black/60 border border-surface-border rounded-xl">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${m.done ? 'border-brand-mint bg-brand-mint/20' : 'border-surface-border'}`}>
                      {m.done && <CheckCircle2 className="w-3 h-3 text-brand-mint" />}
                    </div>
                    <span className={`text-sm ${m.done ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {m.label}
                    </span>
                    {m.done && (
                      <span className="ml-auto text-mono text-[10px] text-brand-mint">DONE</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Participants */}
              <div className="pt-4 border-t border-surface-border flex items-center justify-between">
                <span className="text-mono text-xs text-text-secondary">
                  2 participants connected
                </span>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-brand-mint/20 border-2 border-surface-slate flex items-center justify-center text-xs text-brand-mint font-mono">D</div>
                  <div className="w-8 h-8 rounded-full bg-surface-elevated border-2 border-surface-slate flex items-center justify-center text-xs text-text-primary">C</div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
