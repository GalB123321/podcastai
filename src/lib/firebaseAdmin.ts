import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { env } from '@/env';

let app: App;

// Initialize Firebase Admin if not already initialized
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // Validate required environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY'
    ] as const;

    const missingVars = requiredEnvVars.filter(
      varName => !env[varName]
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required Firebase Admin environment variables: ${missingVars.join(', ')}`
      );
    }

    try {
      app = initializeApp({
        credential: cert({
          projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
      });

      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      console.error('❌ Firebase Admin initialization error:', error);
      throw new Error('Failed to initialize Firebase Admin');
    }
  } else {
    app = getApps()[0];
    console.log('ℹ️ Using existing Firebase Admin instance');
  }

  return app;
}

// Initialize on module load
initializeFirebaseAdmin();

// Export initialized services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export initialization function for explicit initialization
export { initializeFirebaseAdmin }; 