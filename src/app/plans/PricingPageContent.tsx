'use client';

import * as React from 'react';
import Link from 'next/link';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { motion } from 'framer-motion';
import { calculateCredits } from '@/lib/creditUtils';

// Define pricing plans
const plans = [
  {
    id: 'trial',
    name: '🎁 Free Trial',
    price: 'Free',
    perks: ['1 free episode preview']
  },
  { 
    id: 'personal', 
    name: '🔥 Personal', 
    price: '$13', 
    perks: ['Full episodes', '60-sec previews', 'Basic voice customization']
  },
  { 
    id: 'creator', 
    name: '⭐ Creator', 
    price: '$29', 
    perks: ['Download & customize voices', 'Priority support', 'Advanced analytics'],
    recommended: true
  },
  { 
    id: 'business', 
    name: '🚀 Business', 
    price: '$59', 
    perks: ['Spotify export', 'Rollover credits', 'Team collaboration']
  },
  {
    id: 'enterprise',
    name: '🏢 Enterprise',
    perks: ['Custom integrations', 'Dedicated support', 'Volume discounts', 'SLA guarantees']
  }
];

// Define use cases
const uses = [
  { icon: '📝', title: 'Content Creation', desc: 'Batch-produce episode scripts in minutes.' },
  { icon: '🎓', title: 'Educational Platforms', desc: 'Build micro-lessons with AI hosts.' },
  { icon: '📈', title: 'Marketing & Growth', desc: 'Generate branded podcasts for your audience.' },
];

export default function PricingPageContent() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Pricing Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {plans.map(plan => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.05 }}
            className="bg-surface/50 backdrop-blur-sm rounded-2xl p-6 flex flex-col border-2 border-transparent hover:border-accent transition-colors relative"
          >
            {plan.recommended && (
              <span className="absolute -top-3 right-4 bg-accent text-background px-3 py-1 rounded-full text-sm font-medium">
                Recommended
              </span>
            )}
            <h2 className="text-2xl font-semibold text-textPrimary mb-2">{plan.name}</h2>
            {plan.id === 'trial' ? (
              <>
                <p className="text-4xl font-bold text-accent mb-2">{plan.price}</p>
                <p className="mb-4 text-sm text-textSecondary">
                  {/* No credits required for 1-episode preview */}
                </p>
              </>
            ) : plan.price ? (
              <>
                <p className="text-4xl font-bold text-accent mb-2">{plan.price}</p>
                <p className="mb-4 text-sm text-textSecondary">
                  {plan.id === 'personal' && 
                    `~ ${calculateCredits({ lengthTier: 'mini', researchLevel: 'light', voices: 1, emotion: false })} credits/episode`
                  }
                  {plan.id === 'creator' && 
                    `~ ${calculateCredits({ lengthTier: 'standard', researchLevel: 'standard', voices: 2, emotion: true })} credits/episode`
                  }
                  {plan.id === 'business' && 
                    `~ ${calculateCredits({ lengthTier: 'deep', researchLevel: 'deep', voices: 2, emotion: true })} credits/episode`
                  }
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-accent mb-4">Contact us</p>
            )}
            <ul className="flex-1 mb-6 space-y-2 text-textSecondary">
              {plan.perks.map(p => <li key={p} className="flex items-center gap-2">
                <span className="text-accent">•</span> {p}
              </li>)}
            </ul>
            {plan.id === 'trial' ? (
              <Link href="/create?trial=true">
                <PrimaryButton 
                  className="w-full border-2 border-accent bg-transparent hover:bg-accent/10" 
                  aria-label="Start free trial – one episode preview"
                >
                  Start Free Trial
                </PrimaryButton>
              </Link>
            ) : (
              <PrimaryButton 
                className="w-full bg-accent hover:bg-accent/80" 
                aria-label={`Select ${plan.name} plan`}
              >
                {plan.id === 'enterprise' ? 'Contact us' : 'Get Started'}
              </PrimaryButton>
            )}
          </motion.div>
        ))}
      </div>

      {/* Use Cases Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-display bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent mb-8">
          💡 Use Cases
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {uses.map(u => (
            <motion.div
              key={u.title}
              whileHover={{ y: -5 }}
              className="p-6 bg-surface/50 backdrop-blur-sm rounded-xl flex flex-col items-center"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-4xl mb-4"
              >
                {u.icon}
              </motion.div>
              <h3 className="font-semibold text-textPrimary mb-2">{u.title}</h3>
              <p className="text-textSecondary text-center">{u.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <h2 className="text-3xl font-display text-textPrimary mb-6">
          ❓ Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            { q: 'Can I upgrade later?', a: 'Yes, change your plan anytime from your account.' },
            { q: 'Do unused credits roll over?', a: 'In Business plan they do; Personal and Creator credits expire monthly.' },
            { q: 'Can I share access with my team?', a: 'Team collaboration is available on Business and Enterprise plans.' },
          ].map(f => (
            <details
              key={f.q}
              className="bg-surface/50 backdrop-blur-sm rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-accent group"
            >
              <summary 
                className="cursor-pointer font-medium text-textPrimary list-none" 
                aria-label={`${f.q} - Click to expand`}
              >
                {f.q}
              </summary>
              <p className="mt-4 text-textSecondary">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
} 