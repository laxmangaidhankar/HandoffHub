import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-canvas-black border-t border-surface-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">

        <div className="mb-12">
          {/* Brand */}
          <div className="flex items-center gap-2 md:gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-brand-mint flex items-center justify-center">
              <img src="/nav.png" alt="HandoffHub" />
            </div>
            <h2 className="text-heading-lg text-text-primary tracking-tight text-xl">
              HandoffHub
            </h2>
          </div>

          {/* Description */}
          <p className="text-body text-text-secondary max-w-md">
            A structured space for developers and clients to coordinate deliverables,
            review progress, and complete the final project handoff — securely and without accounts.
          </p>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-mono text-text-muted text-xs">
            © {new Date().getFullYear()} HandoffHub. All rights reserved.
          </p>
          <p className="text-mono text-text-muted text-xs">
            Deliver. Review. Handoff.
          </p>
        </div>
      </div>
    </footer>
  );
};
