'use client';
import {
  Auth, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

/** Initiate anonymous sign-in. */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<any> {
  return signInAnonymously(authInstance);
}

/** Initiate email/password sign-up. */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<any> {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in. */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<any> {
  return signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate Google sign-in. */
export function initiateGoogleSignIn(authInstance: Auth): Promise<any> {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(authInstance, provider);
}
