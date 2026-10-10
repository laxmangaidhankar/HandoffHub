import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, LogIn } from 'lucide-react';

export const CTA = () => {
  return (
    <section className="py-24 px-6 bg-canvas-black">
      <div className="max-w-5xl mx-auto relative rounded-4xl overflow-hidden">

        {/* Glow */}
        <div className="absolute inset-0 bg-linear-to-br from-brand-blue/20 via-brand-violet/20 to-brand-mint/20 opacity-50 blur-3xl" />

        {/* Card */}
        <div className="absolute inset-0 bg-surface-slate/80 backdrop-blur-sm border border-surface-border rounded-4xl" />

        {/* Content */}
        <div className="relative z-10 px-8 py-16 md:py-24 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-brand-mint/10 border border-brand-mint/20">
              <span className="w-2 h-2 rounded-full bg-brand-mint animate-pulse" />
              <span className="text-mono text-[10px] text-brand-mint uppercase tracking-wider">
                NO ACCOUNT • NO SETUP
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-heading-lg text-text-primary text-3xl md:text-5xl mb-6 max-w-3xl">
              Start Your Project Handoff Today
            </h2>

            {/* Description */}
            <p className="text-body text-text-secondary text-lg mb-10 max-w-2xl mx-auto">
              Create a project space in seconds, invite your client with an access key,
              and manage the entire delivery — milestones, deliverables, discussions,
              and encrypted credentials — in one place.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/create"
                className="flex items-center gap-2 bg-text-primary text-canvas-black px-8 py-4 rounded-button font-mono text-sm uppercase tracking-wider hover:bg-brand-mint transition-colors shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Start a Project
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/join"
                className="flex items-center gap-2 bg-surface-slate border border-surface-border text-text-primary px-8 py-4 rounded-button font-mono text-sm uppercase tracking-wider hover:bg-surface-elevated transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Join a Project
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
