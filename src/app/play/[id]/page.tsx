import { redirect } from 'next/navigation';
import { getFirestore } from 'firebase-admin/firestore';
import { PlayPageClient } from '@/components/play/PlayPageClient';

interface PlayPageProps {
  params: {
    id: string;
  };
}

async function getEpisodeById(id: string) {
  const db = getFirestore();
  const episodeDoc = await db.collection('episodes').doc(id).get();
  
  if (!episodeDoc.exists) {
    return null;
  }

  const data = episodeDoc.data();
  return {
    id: episodeDoc.id,
    title: data?.title || '',
    description: data?.description || '',
    audioUrl: data?.audioUrl || '',
    createdAt: data?.createdAt?.toDate() || new Date(),
    userId: data?.userId || '',
    status: data?.status || 'draft',
    visibility: data?.visibility || 'private',
    teamAccess: data?.teamAccess || false,
    teamEmails: data?.teamEmails || []
  };
}

export async function generateMetadata({ params }: PlayPageProps) {
  const episode = await getEpisodeById(params.id);
  
  if (!episode) {
    return {
      title: 'Episode Not Found',
      description: 'The requested episode could not be found.'
    };
  }

  return {
    title: episode.title,
    description: episode.description
  };
}

export default async function PlayPage({ params }: PlayPageProps) {
  const episode = await getEpisodeById(params.id);

  if (!episode) {
    redirect('/episodes');
  }

  return <PlayPageClient episode={episode} />;
} 