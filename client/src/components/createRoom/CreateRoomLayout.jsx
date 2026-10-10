import React from 'react';
import { Link } from 'react-router-dom';
import { PackageCheck, Milestone, MessageSquare, ShieldCheck } from 'lucide-react';

export const RoomLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-canvas-black">

      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-[40%] relative bg-surface-slate overflow-hidden border-r border-surface-border flex-col justify-between p-12">
        <div className="absolute inset-0 bg-linear-to-br from-brand-blue/10 via-brand-violet/10 to-brand-mint/10 z-0" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay" />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center">
              <PackageCheck className="w-5 h-5 text-brand-blue" />
            </div>
            <h1 className="text-text-primary tracking-tight text-3xl font-semibold">
              HandoffHub
            </h1>
          </Link>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-lg mt-auto">
          <div className="w-20 h-20 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center mb-8">
            <PackageCheck className="w-10 h-10 text-brand-blue" />
          </div>

          <h2 className="text-display text-text-primary text-4xl mb-6">
            Project delivery,
            <br />
            <span className="text-brand-blue">done right.</span>
          </h2>

          <p className="text-body text-text-secondary text-lg mb-8">
            Create a project space to manage milestones, share deliverables,
            review progress with your client, and complete the final handoff —
            with encrypted credentials the server never sees.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-body text-text-primary">
              <div className="w-6 h-6 rounded-full bg-brand-mint/20 border border-brand-mint/50 flex items-center justify-center shrink-0">
                <Milestone className="w-3.5 h-3.5 text-brand-mint" />
              </div>
              <span>Structured milestones and deliverables</span>
            </div>
            <div className="flex items-center gap-3 text-body text-text-primary">
              <div className="w-6 h-6 rounded-full bg-brand-mint/20 border border-brand-mint/50 flex items-center justify-center shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-brand-mint" />
              </div>
              <span>Project discussions and client reviews</span>
            </div>
            <div className="flex items-center gap-3 text-body text-text-primary">
              <div className="w-6 h-6 rounded-full bg-brand-mint/20 border border-brand-mint/50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-mint" />
              </div>
              <span>End-to-end encrypted credential handoff</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Logo */}
        <Link to="/" className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center">
            <PackageCheck className="w-4 h-4 text-brand-blue" />
          </div>
          <h1 className="text-text-primary tracking-tight text-xl font-semibold">
            HandoffHub
          </h1>
        </Link>

        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};
