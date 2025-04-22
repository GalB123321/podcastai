import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebaseClient';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export async function POST() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Get the user's ID token
    const idToken = await result.user.getIdToken();
    
    // Return the user data and token
    return NextResponse.json({
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      },
      token: idToken,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
} 