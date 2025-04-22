import { Metadata } from 'next';
import ContactPage from './ContactPage';

export const metadata: Metadata = {
  title: 'Contact & Support • PodcastAI',
  description: 'Reach out to PodcastAI for help, partnerships, press, or general inquiries. Explore FAQs and support channels.',
};

export default function Page() {
  return <ContactPage />;
} 