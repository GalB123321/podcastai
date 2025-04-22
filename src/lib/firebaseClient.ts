import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { env } from '@/env';

// Create Firebase configuration object with typed env variables
const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Debug configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔥 Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? '✅ Present' : '❌ Missing',
    authDomain: firebaseConfig.authDomain ? '✅ Present' : '❌ Missing',
    projectId: firebaseConfig.projectId ? '✅ Present' : '❌ Missing',
    storageBucket: firebaseConfig.storageBucket ? '✅ Present' : '❌ Missing',
    messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Present' : '❌ Missing',
    appId: firebaseConfig.appId ? '✅ Present' : '❌ Missing'
  });
}

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;