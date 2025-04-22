'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

const plans = [
  {
    name: '🔥 Basic',
    description: 'All the essentials to get started.',
    annualPrice: '$0',
    monthlyPrice: '$0',
    features: ['Up to 2 episodes', 'Basic support', 'Community access'],
    ctaLink: '/create?plan=basic',
    ctaText: 'Go Basic',
  },
  {
    name: '⭐ Creator',
    description: 'Level up with custom voices & more credits.',
    annualPrice: '$120/yr',
    monthlyPrice: '$16/mo',
    features: ['Up to 10 episodes', 'Priority support', 'Custom tones', 'Advanced analytics'],
    ctaLink: '/create?plan=creator',
    ctaText: 'Try Creator',
    popular: true,
  },
  {
    name: '🚀 Pro',
    description: 'Unlimited episodes with advanced features.',
    annualPrice: '$240/yr',
    monthlyPrice: '$32/mo',
    features: ['Unlimited episodes', 'Team collaboration', 'API access', 'Spotify export'],
    ctaLink: '/create?plan=pro',
    ctaText: 'Go Pro',
  },
];

const useCases = [
  { icon: '📝', title: 'Content Creation', desc: 'Batch-produce episode scripts in minutes.' },
  { icon: '🎓', title: 'Educational', desc: 'Build micro-lessons with AI hosts.' },
  { icon: '📈', title: 'Marketing', desc: 'Generate branded podcasts for your audience.' },
];

const faqs = [
  { q: 'Can I upgrade later?', a: 'Yes, change your plan anytime from your account.' },
  { q: 'Do unused credits roll over?', a: 'In Pro plan they do; Basic and Creator credits expire monthly.' },
  { q: 'Can I share access with my team?', a: 'Team collaboration is available on the Pro plan.' },
];

export default function PricingContent() {
  const [annual, setAnnual] = React.useState(true);

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Hero Section with Toggle */}
      <section className="text-center py-12">
        <h1 className="text-5xl md:text-6xl font-display text-textPrimary mb-2">
          Choose your plan
        </h1>
        <p className="text-lg text-textSecondary max-w-2xl mx-auto mb-6">
          Pick the perfect package to match your podcasting goals—single episodes, binge-worthy series, or unlimited creativity.
        </p>
        
        {/* Annual/Monthly Toggle */}
        <div className="inline-flex bg-surface/30 rounded-full overflow-hidden">
          <button 
            onClick={() => setAnnual(true)}
            aria-pressed={annual}
            className={`px-5 py-2 font-medium transition-colors ${
              annual
                ? 'bg-accent text-background'
                : 'text-textSecondary hover:bg-surface/50'
            }`}
          >
            Annually
          </button>
          <button 
            onClick={() => setAnnual(false)}
            aria-pressed={!annual}
            className={`px-5 py-2 font-medium transition-colors ${
              !annual
                ? 'bg-accent text-background'
                : 'text-textSecondary hover:bg-surface/50'
            }`}
          >
            Monthly
          </button>
        </div>
        {annual && (
          <div className="mt-2 text-sm text-red-500 font-medium animate-bounce">
            Save 20% 🎉
          </div>
        )}
      </section>

      {/* Pricing Grid */}
      <section className="py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              whileHover={{ scale: 1.03 }}
              className={`bg-surface/50 backdrop-blur-sm rounded-2xl p-6 flex flex-col justify-between shadow-lg relative ${
                plan.popular ? 'border-2 border-accent' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-background px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div>
                <h3 className="text-2xl font-semibold text-textPrimary mb-2">
                  {plan.name}
                </h3>
                <p className="text-textSecondary mb-4">
                  {plan.description}
                </p>
                <div className="text-4xl font-bold text-accent mb-6">
                  {annual ? plan.annualPrice : plan.monthlyPrice}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-textSecondary">
                      <span className="text-accent mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href={plan.ctaLink}>
                <PrimaryButton 
                  className={`w-full py-3 ${plan.popular ? 'bg-accent hover:bg-accent/80' : ''}`}
                  aria-label={`Select ${plan.name} plan`}
                >
                  {plan.ctaText}
                </PrimaryButton>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-12">
        <h2 className="text-3xl font-display bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent text-center mb-8">
          💡 Use Cases
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {useCases.map((useCase) => (
            <motion.div
              key={useCase.title}
              whileHover={{ y: -5 }}
              className="bg-surface/30 rounded-xl p-6 text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-4xl mb-4"
              >
                {useCase.icon}
              </motion.div>
              <h3 className="font-semibold text-textPrimary mb-2">{useCase.title}</h3>
              <p className="text-textSecondary">{useCase.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12">
        <h2 className="text-3xl font-display text-textPrimary text-center mb-8">
          ❓ Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="bg-surface/30 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-accent group"
            >
              <summary 
                className="cursor-pointer font-medium text-textPrimary list-none" 
                aria-label={`${faq.q} - Click to expand`}
              >
                {faq.q}
              </summary>
              <p className="mt-4 text-textSecondary">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12">
        <div className="bg-accent/10 py-12 px-6 rounded-xl text-center">
          <h3 className="text-2xl font-display text-textPrimary mb-4">
            Ready to launch your first episode?
          </h3>
          <Link href="/create">
            <PrimaryButton 
              className="px-10 py-4 animate-pulse bg-accent hover:bg-accent/80"
              aria-label="Start creating your podcast now"
            >
              Start Creating Now
            </PrimaryButton>
          </Link>
        </div>
      </section>
    </div>
  );
} 