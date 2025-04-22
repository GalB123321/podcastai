'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import PlaylistCarousel from '@/components/dashboard/PlaylistCarousel';

// Sample topic data - replace with actual images
const topics = [
  { id: 'ai-tools', title: 'AI Tools', imageUrl: '/images/topics/ai-tools.jpg' },
  { id: 'startup-stories', title: 'Startup Stories', imageUrl: '/images/topics/startup.jpg' },
  { id: 'health-wellness', title: 'Health & Wellness', imageUrl: '/images/topics/health.jpg' },
  { id: 'tech-trends', title: 'Tech Trends', imageUrl: '/images/topics/tech.jpg' },
  { id: 'education', title: 'Education', imageUrl: '/images/topics/education.jpg' },
  { id: 'business', title: 'Business', imageUrl: '/images/topics/business.jpg' },
];

// Sample category data
const categories = [
  { id: 'tech', icon: '💻', title: 'Technology' },
  { id: 'health', icon: '🧘‍♂️', title: 'Health & Wellness' },
  { id: 'business', icon: '💼', title: 'Business' },
  { id: 'education', icon: '📚', title: 'Education' },
  { id: 'entertainment', icon: '🎭', title: 'Entertainment' },
  { id: 'lifestyle', icon: '🌟', title: 'Lifestyle' },
  { id: 'science', icon: '🔬', title: 'Science' },
  { id: 'sports', icon: '⚽', title: 'Sports' },
];

function CategoryCard({ icon, title }: { icon: string; title: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-surface/50 backdrop-blur-sm rounded-xl p-6 text-center"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-textPrimary">{title}</h3>
    </motion.div>
  );
}

export default function DiscoverPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="w-full bg-background py-20 md:py-32 text-center">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-display text-white mb-4">
            Discover Any Podcast Topic, For Any Need.
          </h1>
          <p className="text-lg md:text-xl text-textSecondary mb-8 max-w-2xl mx-auto">
            1 platform, 1,000+ topic ideas, infinite inspiration. Swipe through our topic gallery, browse by use case, or drill down by persona.
          </p>
        </div>
      </section>

      {/* Topic Gallery Carousel */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <PlaylistCarousel
            episodes={topics.map(topic => ({
              id: topic.id,
              title: topic.title,
              thumbnailUrl: topic.imageUrl,
              duration: 0,
              status: 'published' as const
            }))}
            onSelect={(id: string) => console.log('Selected topic:', id)}
          />
        </div>
      </section>

      {/* Filter Columns */}
      <section className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Solutions */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Solutions</h2>
          <ul className="space-y-2 max-h-64 overflow-auto text-textSecondary">
            <li>Interview Prep</li>
            <li>Career Advice</li>
            <li>Product Reviews</li>
            <li>Industry Analysis</li>
            <li>Expert Insights</li>
            <li>Tutorial Series</li>
            <li>Case Studies</li>
            <li>Market Research</li>
          </ul>
        </div>
        {/* Personas */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Personas</h2>
          <ul className="space-y-2 max-h-64 overflow-auto text-textSecondary">
            <li>Entrepreneur</li>
            <li>Educator</li>
            <li>Content Creator</li>
            <li>Industry Expert</li>
            <li>Coach/Mentor</li>
            <li>Student</li>
            <li>Professional</li>
            <li>Thought Leader</li>
          </ul>
        </div>
        {/* Categories */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Categories</h2>
          <ul className="space-y-2 max-h-64 overflow-auto text-textSecondary">
            <li>Technology</li>
            <li>Health & Wellness</li>
            <li>Business Strategy</li>
            <li>Personal Development</li>
            <li>Science & Research</li>
            <li>Arts & Culture</li>
            <li>Sports & Fitness</li>
            <li>Education & Learning</li>
          </ul>
        </div>
      </section>

      {/* Newsletter CTA Bar */}
      <section className="bg-accent/10 backdrop-blur-sm px-4 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-lg text-textPrimary">
            🔔 Get fresh podcast ideas delivered weekly to your inbox.
          </p>
          <div className="flex items-center gap-4 max-w-3xl w-full md:w-auto">
            <input 
              type="email" 
              placeholder="Your email" 
              className="flex-1 p-3 rounded-lg bg-surface text-textPrimary"
              aria-label="Email subscription input"
            />
            <PrimaryButton>Subscribe</PrimaryButton>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16">
        <h2 className="text-2xl font-display text-white text-center mb-8">
          Popular Categories
        </h2>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(cat => (
            <CategoryCard key={cat.id} icon={cat.icon} title={cat.title} />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-accent/10 backdrop-blur-sm py-12 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-4">Ready to turn an idea into an episode?</h2>
          <Link href="/create">
            <PrimaryButton>Start Your Podcast</PrimaryButton>
          </Link>
        </div>
      </section>
    </>
  );
} 