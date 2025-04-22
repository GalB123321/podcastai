'use client';

import * as React from 'react';
import { InputField } from '@/components/ui/InputField';
import { TextareaField } from '@/components/ui/TextareaField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { useForm } from 'react-hook-form';
import { FaEnvelope, FaPhone, FaClock, FaMapMarkerAlt, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

const CONTACT_INFO = [
  {
    icon: FaEnvelope,
    label: 'Email',
    value: 'support@podcastai.com',
  },
  {
    icon: FaPhone,
    label: 'Phone',
    value: '+1 (555) 123-4567',
  },
  {
    icon: FaClock,
    label: 'Hours',
    value: 'Mon-Fri: 9am - 5pm PST',
  },
  {
    icon: FaMapMarkerAlt,
    label: 'Location',
    value: 'San Francisco, CA',
  },
];

const SOCIAL_LINKS = [
  {
    icon: FaTwitter,
    href: 'https://twitter.com/podcastai',
    label: 'Twitter',
  },
  {
    icon: FaLinkedin,
    href: 'https://linkedin.com/company/podcastai',
    label: 'LinkedIn',
  },
  {
    icon: FaGithub,
    href: 'https://github.com/podcastai',
    label: 'GitHub',
  },
];

const FAQ_ITEMS = [
  {
    title: 'How do I get started with PodcastAI?',
    content: 'Sign up for a free account, choose your plan, and start creating your first podcast episode using our AI-powered tools.',
  },
  {
    title: 'What payment methods do you accept?',
    content: 'We accept all major credit cards, PayPal, and offer enterprise billing options for larger organizations.',
  },
  {
    title: 'Can I cancel my subscription anytime?',
    content: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.',
  },
  {
    title: 'How does the AI content generation work?',
    content: 'Our AI analyzes your topic and preferences to generate engaging podcast scripts while maintaining your unique voice and style.',
  },
];

export default function ContactPage() {
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting, isSubmitSuccessful } 
  } = useForm<ContactFormData>();
  
  const onSubmit = async (data: ContactFormData) => {
    try {
      setSubmitError(null);
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      reset();
    } catch (err) {
      console.error('Contact submit error:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <header className="text-center mb-16">
        <h1 className="text-4xl font-display text-textPrimary mb-4">
          Contact & Support
        </h1>
        <p className="text-xl text-textSecondary max-w-2xl mx-auto">
          Have questions or need assistance? We're here to help! Choose from our support channels below or check our frequently asked questions.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-display text-textPrimary mb-6">Get in Touch</h2>
          
          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {CONTACT_INFO.map(({ icon: Icon, label, value }) => (
              <div key={label} className="p-4 bg-surface rounded-lg border border-muted">
                <Icon className="text-accent mb-2 text-xl" />
                <h3 className="font-medium text-textPrimary">{label}</h3>
                <p className="text-textSecondary">{value}</p>
              </div>
            ))}
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-medium text-textPrimary mb-4">Follow Us</h3>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-textSecondary hover:text-accent transition-colors"
                  aria-label={label}
                >
                  <Icon className="text-2xl" />
                </a>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-display text-textPrimary mb-6">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible>
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  title={item.title}
                  content={item.content}
                />
              ))}
            </Accordion>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-surface p-8 rounded-xl border border-muted">
          <h2 className="text-2xl font-display text-textPrimary mb-6">Send a Message</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <InputField
              id="name"
              label="Name"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
              aria-invalid={!!errors.name}
            />
            <InputField
              id="email"
              type="email"
              label="Email"
              {...register('email', {
                required: 'Email is required',
                pattern: { 
                  value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/, 
                  message: 'Invalid email' 
                }
              })}
              error={errors.email?.message}
              aria-invalid={!!errors.email}
            />
            <TextareaField
              label="Message"
              rows={6}
              {...register('message', { required: 'Message cannot be empty' })}
              error={errors.message?.message}
              aria-invalid={!!errors.message}
            />
            <div className="flex justify-end">
              <PrimaryButton 
                type="submit" 
                disabled={isSubmitting}
                className="bg-accent hover:bg-accent/90 focus:ring-accent/20"
              >
                {isSubmitting ? 'Sending…' : isSubmitSuccessful ? 'Sent!' : 'Send Message'}
              </PrimaryButton>
            </div>
          </form>

          {/* Error Message */}
          {submitError && (
            <p className="mt-4 text-red-500 text-center" role="alert">
              {submitError}
            </p>
          )}

          {/* Success Message */}
          {isSubmitSuccessful && !submitError && (
            <p className="mt-4 text-green-400 text-center" role="alert">
              Thank you! We'll be in touch soon.
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 