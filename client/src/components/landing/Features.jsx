import React from 'react';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  MessageSquare,
  Link2,
  CheckCircle2,
  ShieldCheck,
  Flag,
} from 'lucide-react';

const features = [
  {
    icon: FolderKanban,
    title: 'Project Overview',
    desc: 'Document the project scope, requirements, technology stack, timeline, and milestones in one structured place.',
    color: 'var(--brand-mint)',
  },
  {
    icon: MessageSquare,
    title: 'Project Discussions',
    desc: 'Clarify features, answer questions, post updates, and resolve feedback in a project-specific discussion area.',
    color: 'var(--brand-blue)',
  },
  {
    icon: Link2,
    title: 'Deliverables',
    desc: 'Organize GitHub repos, live demos, design links, API documentation, and screenshots by project or milestone.',
    color: 'var(--brand-violet)',
  },
  {
    icon: Flag,
    title: 'Milestone Tracking',
    desc: 'Track milestone status, deadlines, and completion. Client can approve or request changes per milestone.',
    color: 'var(--brand-mint)',
  },
  {
    icon: CheckCircle2,
    title: 'Client Review',
    desc: 'Client approves deliverables or requests revisions. Developer receives structured feedback and submits updates.',
    color: 'var(--semantic-info)',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Final Handoff',
    desc: 'Share deployment credentials, API keys, and env variables with end-to-end encryption. The server never sees plaintext secrets.',
    color: 'var(--semantic-warning)',
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-canvas-black">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-heading-lg text-text-primary text-3xl md:text-4xl mb-4">
            Everything for a Structured Handoff
          </h2>
          <p className="text-body text-text-secondary text-lg">
            From requirements to delivery — manage the entire project lifecycle
            between developer and client in one dedicated space.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-surface-slate border border-surface-border rounded-2xl p-6 relative overflow-hidden group hover:border-brand-mint/50 hover:shadow-lg transition-all"
              >
                {/* Glow */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity"
                  style={{ backgroundImage: `linear-gradient(to bottom right, ${feature.color}, transparent)` }}
                />

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl border border-surface-border bg-surface-elevated flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>

                {/* Content */}
                <h3 className="text-heading-md text-text-primary mb-3">{feature.title}</h3>
                <p className="text-body text-text-secondary">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
