import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseClient';

export interface FirestoreUser {
  uid: string;
  email: string | null;
  name: string;
  plan: 'free' | 'creator' | 'business';
  credits: number;
  onboardingComplete: boolean;
  createdAt: Date;
}

export async function createOrFetchUser(user: { uid: string; email: string | null; displayName: string | null }): Promise<FirestoreUser> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    console.log('Creating new user document for:', user.email);
    const newUser: Omit<FirestoreUser, 'createdAt'> & { createdAt: any } = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || '',
      plan: 'free',
      credits: 10,
      onboardingComplete: false,
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, newUser);
    // Fetch again to get the server timestamp
    return (await getDoc(ref)).data() as FirestoreUser;
  }

  return snap.data() as FirestoreUser;
} 