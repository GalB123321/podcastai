'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { gsap } from 'gsap';
import Link from 'next/link';

export default function FeaturesPage() {
  // GSAP refs
  const tabRefs = {
    personal: useRef<HTMLDivElement>(null),
    creator: useRef<HTMLDivElement>(null),
    business: useRef<HTMLDivElement>(null),
  };
  const [activeTab, setActiveTab] = useState<'personal'|'creator'|'business'>('personal');

  // Animate on tab switch
  useEffect(() => {
    const tl = gsap.timeline();
    // Fade out all tabs first
    Object.values(tabRefs).forEach(ref => {
      if (ref.current) {
        gsap.set(ref.current, { opacity: 0 });
      }
    });
    // Fade in active tab
    if (tabRefs[activeTab].current) {
      gsap.to(tabRefs[activeTab].current, { 
        opacity: 1, 
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }, [activeTab]);

  return (
    <>
      {/* Hero + Tabs */}
      <section className="bg-background text-white py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Heading + Tabs */}
          <div>
            <h1 className="text-5xl md:text-6xl font-display mb-4">
              Explore PodcastAI's Power Features
            </h1>
            <p className="text-lg text-textSecondary mb-8">
              Whether you're learning, growing an audience, or scaling your business—PodcastAI tailors every step.
            </p>
            {/* Interactive Tabs */}
            <div className="flex gap-4 mb-6">
              {(['personal','creator','business'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    activeTab===tab
                      ? 'bg-accent border-accent text-background'
                      : 'bg-surface border-surface/50 text-textSecondary hover:border-accent/50'
                  }`}
                  aria-selected={activeTab === tab}
                >
                  {tab === 'personal' ? 'Personal' : tab === 'creator' ? 'Creator' : 'Business'}
                </button>
              ))}
            </div>
            {/* Tab Content */}
            <div className="relative min-h-[280px]">
              <div
                ref={tabRefs.personal}
                className="absolute inset-0"
                aria-hidden={activeTab !== 'personal'}
              >
                <h3 className="text-2xl font-semibold mb-2">Personal Learning & Habit</h3>
                <ul className="list-disc pl-5 space-y-2 text-textSecondary">
                  <li>Auto-crafted learning episodes to build your daily podcast habit</li>
                  <li>Step-by-step listening schedules to reinforce new skills</li>
                  <li>Reflection prompts that cement what you learned</li>
                </ul>
              </div>
              <div
                ref={tabRefs.creator}
                className="absolute inset-0"
                aria-hidden={activeTab !== 'creator'}
              >
                <h3 className="text-2xl font-semibold mb-2">Creator Growth & Engagement</h3>
                <ul className="list-disc pl-5 space-y-2 text-textSecondary">
                  <li>Tools to craft attention-grabbing intros and outros</li>
                  <li>Audience analytics suggestions baked into your script</li>
                  <li>Social share snippets automatically generated</li>
                </ul>
              </div>
              <div
                ref={tabRefs.business}
                className="absolute inset-0"
                aria-hidden={activeTab !== 'business'}
              >
                <h3 className="text-2xl font-semibold mb-2">Business Promotion & ROI</h3>
                <ul className="list-disc pl-5 space-y-2 text-textSecondary">
                  <li>Custom CTAs woven directly into your dialogue</li>
                  <li>Product highlight segments for maximum impact</li>
                  <li>Scheduling toolkit for weekly drip-campaign episodes</li>
                </ul>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/create">
                <PrimaryButton>Try It Now</PrimaryButton>
              </Link>
            </div>
          </div>

          {/* Right: Hero Illustration */}
          <div className="flex justify-center">
            <img
              src="/images/features-hero.png"
              alt="Features illustration"
              className="w-full max-w-md rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Feature Details */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Personal */}
            <div className="bg-surface/50 backdrop-blur-sm rounded-xl p-8">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3">Personal Growth</h3>
              <p className="text-textSecondary mb-4">
                Turn your learning goals into engaging podcast episodes. Track progress, set milestones, and build lasting habits.
              </p>
              <ul className="space-y-2 text-sm text-textSecondary">
                <li>• Daily learning prompts</li>
                <li>• Progress tracking</li>
                <li>• Customized content paths</li>
              </ul>
            </div>

            {/* Creator */}
            <div className="bg-surface/50 backdrop-blur-sm rounded-xl p-8">
              <div className="text-3xl mb-4">🎙️</div>
              <h3 className="text-xl font-semibold mb-3">Creator Suite</h3>
              <p className="text-textSecondary mb-4">
                Everything you need to grow your podcast audience. From content planning to engagement analytics.
              </p>
              <ul className="space-y-2 text-sm text-textSecondary">
                <li>• Audience insights</li>
                <li>• Content calendar</li>
                <li>• Social media kit</li>
              </ul>
            </div>

            {/* Business */}
            <div className="bg-surface/50 backdrop-blur-sm rounded-xl p-8">
              <div className="text-3xl mb-4">💼</div>
              <h3 className="text-xl font-semibold mb-3">Business Growth</h3>
              <p className="text-textSecondary mb-4">
                Convert listeners into customers with strategic podcast content. Measure ROI and scale your reach.
              </p>
              <ul className="space-y-2 text-sm text-textSecondary">
                <li>• Lead generation</li>
                <li>• Campaign tracking</li>
                <li>• ROI analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-accent/10 backdrop-blur-sm py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-display mb-4">Ready to Start Your Podcast Journey?</h2>
          <p className="text-lg text-textSecondary mb-8">
            Join thousands of creators who are already using PodcastAI to grow their audience.
          </p>
          <Link href="/create">
            <PrimaryButton>Create Your First Episode</PrimaryButton>
          </Link>
        </div>
      </section>
    </>
  );
} 