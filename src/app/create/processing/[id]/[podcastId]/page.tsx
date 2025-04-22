import { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getFirestore } from 'firebase-admin/firestore';
import { auth } from '@/lib/auth';
import { ProcessingStatus } from '@/components/podcast/ProcessingStatus';

export const metadata: Metadata = {
  title: "Generating Your Podcast | PodcastAI",
  description: "Your podcast is being generated. Please wait while we create your content."
};

export default async function ProcessingPage({ params }: { params: { podcastId: string } }) {
  // Get session using the auth helper
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  // Use Firestore directly
  const db = getFirestore();
  const podcastDoc = await db.collection('podcasts').doc(params.podcastId).get();
  
  if (!podcastDoc.exists || podcastDoc.data()?.userId !== session.user.id) {
    redirect('/create');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Generating Your Podcast</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ProcessingStatus episodeId={params.podcastId} />
      </Suspense>
    </div>
  );
} 