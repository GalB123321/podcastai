import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from '@/env';

let app: App;

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  app = initializeApp({
    credential: cert({
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY,
    })
  });
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);

export function getApp() {
  return app;
}

export function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert({
        projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  }
  return app;
} 