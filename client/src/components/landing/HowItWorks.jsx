import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, CheckCircle2, PackageCheck } from 'lucide-react';

const steps = [
  {
    id: '01',
    icon: Plus,
    title: 'Developer Creates Project',
    desc: 'Add the project overview, requirements, technology stack, timeline, milestones, and deliverables. Then invite the client using an access key.',
  },
  {
    id: '02',
    icon: Users,
    title: 'Collaborate & Communicate',
    desc: 'Discuss requirements, clarify features, share links, post progress updates, and resolve questions in a project-specific discussion area.',
  },
  {
    id: '03',
    icon: CheckCircle2,
    title: 'Client Reviews Work',
    desc: 'The client approves milestones or requests changes. The developer receives structured feedback and submits an updated version for review.',
  },
  {
    id: '04',
    icon: PackageCheck,
    title: 'Complete the Handoff',
    desc: 'Developer shares final documentation, deployment details, and encrypted credentials. HandoffHub keeps a record of approvals and delivery events.',
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-surface-slate border-y border-surface-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-20 text-center md:text-left">
          <h2 className="text-heading-lg text-text-primary text-3xl md:text-5xl mb-6">
            How It Works
          </h2>
          <p className="text-body text-text-secondary text-lg md:text-xl max-w-3xl">
            From project kickoff to final delivery — a structured workflow
            designed for developer-client collaboration.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-12">

          {/* Progress line */}
          <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-surface-border">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="h-full bg-linear-to-r from-brand-mint via-brand-blue to-brand-violet"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="flex flex-col items-center md:items-start gap-6 bg-canvas-black md:bg-transparent p-8 md:p-0 rounded-2xl border border-surface-border md:border-none relative group hover:-translate-y-2 transition-transform duration-300"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-canvas-black border border-surface-border flex items-center justify-center shrink-0 shadow-lg group-hover:border-brand-mint transition-colors relative z-10 overflow-hidden">
                    <Icon className="w-10 h-10 md:w-12 md:h-12 text-brand-mint absolute opacity-10 scale-150 group-hover:scale-110 transition-transform duration-500" />
                    <span className="text-mono font-bold text-text-primary text-xl relative z-10 group-hover:text-brand-mint transition-colors">
                      {step.id}
                    </span>
                  </div>

                  <div className="text-center md:text-left flex-1">
                    <h4 className="text-heading-md text-text-primary text-xl md:text-2xl mb-3 group-hover:text-brand-mint transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-body text-text-secondary text-base leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
