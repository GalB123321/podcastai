import { getFirestore } from 'firebase-admin/firestore';
import { getApp } from 'firebase-admin/app';

export type PlanType = 'free' | 'creator' | 'business';

export async function getPlanForUid(uid: string): Promise<PlanType> {
  const db = getFirestore(getApp());
  const userDoc = await db.collection('users').doc(uid).get();
  
  if (!userDoc.exists) {
    return 'free';
  }

  const data = userDoc.data();
  return (data?.plan as PlanType) || 'free';
} 