import { getFirestore } from 'firebase-admin/firestore';
import { getApp } from '@/lib/firebase-admin';

// Initialize Firestore
const app = getApp();
export const db = getFirestore(app); 