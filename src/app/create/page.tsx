import { Metadata } from 'next';
import { Lightbulb, Rocket, Sparkles, Star } from 'lucide-react';
import { PromptWizard } from '@/components/prompt/PromptWizard';

const quickTemplates = [
  {
    title: "Tech Review",
    description: "Perfect for reviewing latest gadgets and tech trends",
    icon: Rocket,
  },
  {
    title: "Interview Style",
    description: "Great for expert interviews and discussions",
    icon: Star,
  },
  {
    title: "Educational",
    description: "Ideal for teaching complex topics simply",
    icon: Lightbulb,
  }
];

const businessFeatures = [
  "Custom branding & intro music",
  "Priority voice generation",
  "Advanced analytics dashboard",
  "Team collaboration tools",
  "Priority support 24/7",
  "Custom domain support"
];

const podcastingTips = [
  "Keep episodes consistent in length",
  "Use engaging hooks in first 30 seconds",
  "Include clear call-to-actions",
  "Maintain regular publishing schedule",
  "Engage with your audience feedback"
];

export const metadata: Metadata = {
  title: 'Create Your Podcast | PodcastAI',
  description: 'Start generating your podcast in minutes. Powered by AI and built for creators, professionals, and businesses.',
};

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left and Center */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Create Your Podcast
              </h1>
              <p className="text-gray-400">
                Transform your ideas into engaging podcast episodes with AI assistance
              </p>
            </div>

            {/* Quick Templates */}
            <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Quick Start Templates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickTemplates.map((template, index) => (
                  <button
                    key={index}
                    className="p-4 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all border border-gray-600 text-left"
                  >
                    <template.icon className="w-6 h-6 mb-2 text-blue-400" />
                    <h3 className="font-medium">{template.title}</h3>
                    <p className="text-sm text-gray-400">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Form */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <PromptWizard />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Business Features */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Business Plan Features
              </h2>
              <ul className="space-y-3">
                {businessFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg py-2 px-4 hover:opacity-90 transition-opacity">
                Upgrade to Business
              </button>
            </div>

            {/* Podcasting Tips */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Pro Tips
              </h2>
              <ul className="space-y-3">
                {podcastingTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <span className="text-blue-400 font-medium">{index + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
              <h2 className="text-xl font-semibold mb-2">Need Help?</h2>
              <p className="text-gray-400 mb-4">
                Our support team is available 24/7 to help you create amazing podcasts
              </p>
              <button className="w-full bg-white/10 text-white rounded-lg py-2 px-4 hover:bg-white/20 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 