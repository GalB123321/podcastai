import { NextAuthOptions } from 'next-auth';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import { cert } from 'firebase-admin/app';
import { env } from '@/env';
import GoogleProvider from 'next-auth/providers/google';
import { getServerSession } from 'next-auth';

// Define session and user types
declare module 'next-auth' {
  interface Session {
    firebaseToken?: string;
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    firebaseToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  adapter: FirestoreAdapter({
    credential: cert({
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY,
    }),
  }),
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
        // You can add additional user data here from your database
      }
      return session;
    },
    jwt: async ({ token, user, account }) => {
      if (user) {
        token.uid = user.id;
      }
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'database'
  }
};

export type Session = {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
  firebaseToken?: string;
} | null;

/**
 * Helper to get the session on the server side
 */
export async function auth(): Promise<Session> {
  const session = await getServerSession(authOptions);
  return session as Session;
} 