export interface Episode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  createdAt: Date;
  userId: string;
  status: 'draft' | 'ready' | 'published';
  visibility: 'private' | 'public';
  teamAccess: boolean;
  teamEmails: string[];
} 