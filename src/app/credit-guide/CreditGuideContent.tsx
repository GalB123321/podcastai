'use client';

import * as React from 'react';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import Link from 'next/link';

export default function CreditGuideContent() {
  return (
    <>
      {/* Hero Section */}
      <section className="w-full bg-background py-20 md:py-32 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-display text-textPrimary mb-4">
            🎯 PodcastAI Credit Calculation Guide
          </h1>
          <p className="text-xl text-textSecondary">
            Understand how credits are computed for every podcast you generate.
          </p>
        </div>
      </section>

      {/* Constants & Base Costs */}
      <section className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-textPrimary mb-4">Constants & Base Costs</h2>
        <pre className="bg-surface p-4 rounded-lg overflow-auto mb-6" aria-label="Code example">
          <code>{`// Base cost per episode by length
const LENGTH_TIER_COSTS = {
  mini: 3,      // 3–5 min (~1,000 words)
  standard: 6,  // 7–10 min (~3,000 words)
  deep: 9       // 12–15 min (~4,500 words)
};

// Default voices cost
const DEFAULT_VOICES = 2; // 2 voices included for free
const EXTRA_VOICE_COST = 2; // per additional voice

// Promotion cost: 1 credit per 100 words or fraction
function promotionCost(wordCount: number) {
  return Math.max(1, Math.ceil(wordCount / 100));
}

// Scheduling cost
const SCHEDULING_COST = 1; // per episode scheduled in advance`}</code>
        </pre>
      </section>

      {/* Main Credit Calculation Formula */}
      <section className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-textPrimary mb-4">Main Credit Calculation Formula</h2>
        <pre className="bg-surface p-4 rounded-lg overflow-auto mb-6" aria-label="Code example">
          <code>{`function calculateCredits({
  lengthTier,
  voices = DEFAULT_VOICES,
  wordCountForPromotion = 0,
  episodes = 2,
  scheduledEpisodes = 0
}: {
  lengthTier: keyof typeof LENGTH_TIER_COSTS;
  voices?: number;
  wordCountForPromotion?: number;
  episodes?: number;
  scheduledEpisodes?: number;
}) {
  // 1. Base cost per episode
  const base = LENGTH_TIER_COSTS[lengthTier];

  // 2. Promotion cost (if any)
  const promo = wordCountForPromotion > 0 
    ? promotionCost(wordCountForPromotion) 
    : 0;

  // 3. Extra voices cost
  const extraVoices = Math.max(0, voices - DEFAULT_VOICES) 
    * EXTRA_VOICE_COST;

  // 4. Scheduling cost
  const scheduleCost = scheduledEpisodes * SCHEDULING_COST;

  // 5. Total per episode
  const perEpisode = base + promo + extraVoices + scheduleCost;

  // 6. Total for all episodes (minimum 2 episodes)
  const totalEpisodes = Math.max(episodes, 2);
  return perEpisode * totalEpisodes;
}`}</code>
        </pre>
      </section>

      {/* Examples */}
      <section className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-textPrimary mb-4">Examples</h2>
        
        <h3 className="text-lg font-semibold text-textPrimary mt-6 mb-2">
          Standard mini-podcast (2 episodes, 2 voices, no promotion, no scheduling):
        </h3>
        <pre className="bg-surface p-4 rounded-lg overflow-auto mb-6" aria-label="Code example">
          <code>{`calculateCredits({ lengthTier: 'mini' });
// base 3 + 0 promo + 0 extraVoices + 0 schedule = 3 per episode
// 3 * 2 episodes = 6 credits`}</code>
        </pre>

        <h3 className="text-lg font-semibold text-textPrimary mt-6 mb-2">
          Professional dual-voice with promotion (3 episodes, 3 voices, 250-word promotion, schedule 1):
        </h3>
        <pre className="bg-surface p-4 rounded-lg overflow-auto mb-6" aria-label="Code example">
          <code>{`calculateCredits({
  lengthTier: 'standard',
  voices: 3,
  wordCountForPromotion: 250,
  episodes: 3,
  scheduledEpisodes: 1
});
// base 6 + promo ceil(250/100)=3 + extra voice 2 + schedule 1 = 12 per episode
// 12 * 3 episodes = 36 credits`}</code>
        </pre>

        <h3 className="text-lg font-semibold text-textPrimary mt-6 mb-2">
          Deep-dive with scheduling only (2 episodes, 2 voices, no promotion, 2 scheduled):
        </h3>
        <pre className="bg-surface p-4 rounded-lg overflow-auto mb-6" aria-label="Code example">
          <code>{`calculateCredits({
  lengthTier: 'deep',
  scheduledEpisodes: 2
});
// base 9 + 0 promo + 0 extraVoices + 2 schedule = 11 per episode
// 11 * 2 episodes = 22 credits`}</code>
        </pre>
      </section>

      {/* Price per Credit */}
      <section className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-textPrimary mb-4">💵 Price per Credit (User Pricing)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-textSecondary dark:text-textSecondary" aria-label="Pricing table">
            <thead className="text-xs uppercase bg-surface/30">
              <tr>
                <th className="px-4 py-3">Credits Purchased</th>
                <th className="px-4 py-3">Price (USD)</th>
                <th className="px-4 py-3">Effective Rate (USD/credit)</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-muted/30">
                <td className="px-4 py-3">1</td>
                <td className="px-4 py-3">$1.00</td>
                <td className="px-4 py-3">$1.00</td>
                <td className="px-4 py-3">Single credit purchase</td>
              </tr>
              <tr className="border-b border-muted/30">
                <td className="px-4 py-3">10</td>
                <td className="px-4 py-3">$9.00</td>
                <td className="px-4 py-3">$0.90</td>
                <td className="px-4 py-3">10% volume discount</td>
              </tr>
              <tr className="border-b border-muted/30">
                <td className="px-4 py-3">30</td>
                <td className="px-4 py-3">$25.00</td>
                <td className="px-4 py-3">$0.83</td>
                <td className="px-4 py-3">~17% volume discount</td>
              </tr>
              <tr className="border-b border-muted/30">
                <td className="px-4 py-3">50</td>
                <td className="px-4 py-3">$40.00</td>
                <td className="px-4 py-3">$0.80</td>
                <td className="px-4 py-3">20% volume discount</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-textSecondary">
          Customers can choose the credit bundle that fits their needs, with larger bundles offering greater savings.
        </p>
      </section>

      {/* Platform Cost per Credit */}
      <section className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold text-textPrimary mb-4">🏭 Platform Cost per Credit (Internal Cost Breakdown)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-textSecondary dark:text-textSecondary" aria-label="Internal cost breakdown table">
            <thead className="text-xs uppercase bg-surface/30">
              <tr>
                <th className="px-4 py-3">Cost Component</th>
                <th className="px-4 py-3">Unit Cost</th>
                <th className="px-4 py-3">Cost per Credit (USD)</th>
                <th className="px-4 py-3">Calculation Details</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-muted/30">
                <td className="px-4 py-3">OpenAI (prompt & script)</td>
                <td className="px-4 py-3">$0.03 per 1k tokens output</td>
                <td className="px-4 py-3">~$0.03</td>
                <td className="px-4 py-3">Based on average 1k tokens ≈ 1 credit</td>
              </tr>
              <tr className="border-b border-muted/30">
                <td className="px-4 py-3">ElevenLabs (2 voices mix)</td>
                <td className="px-4 py-3">$1.80 per 2-voice episode</td>
                <td className="px-4 py-3">$0.30 (per 6 credits)</td>
                <td className="px-4 py-3">$1.80/6 credits ≈ $0.30</td>
              </tr>
              <tr className="border-b border-muted/30">
                <td className="px-4 py-3">FFmpeg processing & hosting</td>
                <td className="px-4 py-3">$0.10 per episode</td>
                <td className="px-4 py-3">~$0.02</td>
                <td className="px-4 py-3">Amortized over 6 credits</td>
              </tr>
              <tr className="border-b border-muted/30">
                <td className="px-4 py-3">Infrastructure & overhead</td>
                <td className="px-4 py-3">$0.20 per episode</td>
                <td className="px-4 py-3">~$0.03</td>
                <td className="px-4 py-3">Support, maintenance, monitoring</td>
              </tr>
              <tr className="border-b border-muted/30 font-semibold">
                <td className="px-4 py-3">Total Estimated Cost</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3">~$0.38</td>
                <td className="px-4 py-3">Sum of all components yields ≈ 38¢ per credit internally</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-accent/10 backdrop-blur-sm py-12 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to generate your next podcast?</h2>
          <Link href="/create">
            <PrimaryButton className="bg-background text-accent hover:bg-background/90">
              Start Creating
            </PrimaryButton>
          </Link>
        </div>
      </section>
    </>
  );
} 