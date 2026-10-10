import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: 'E2EE', label: 'Encrypted Credentials' },
  { value: '5', label: 'Project Sections' },
  { value: '24h', label: 'Session Lifetime' },
  { value: 'Zero', label: 'Account Required' },
];

export const Stats = () => {
  return (
    <section className="py-12 bg-surface-slate border-y border-surface-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-surface-border/50">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col items-center justify-center text-center px-4"
            >
              <span className="text-3xl md:text-4xl lg:text-5xl text-text-primary font-bold mb-2">
                {stat.value}
              </span>
              <span className="text-mono text-xs md:text-sm text-text-secondary">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
