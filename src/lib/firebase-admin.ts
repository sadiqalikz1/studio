import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let adminApp: any = null;
let adminDb: any = null;
let adminAuth: any = null;

/**
 * Initialize Firebase Admin SDK
 * In development, uses service account from FIREBASE_ADMIN_SDK_KEY env var
 * In production (App Hosting), Firebase Admin automatically initialized
 */
function getAdminApp() {
  if (adminApp) return adminApp;

  const existingApp = getApps().length > 0 ? getApps()[0] : null;
  if (existingApp) {
    adminApp = existingApp;
    return adminApp;
  }

  try {
    // Try to use the SDK key if available (local development)
    const serviceAccountKey = process.env.FIREBASE_ADMIN_SDK_KEY;
    
    if (serviceAccountKey) {
      const serviceAccount = JSON.parse(
        Buffer.from(serviceAccountKey, 'base64').toString('utf-8')
      );
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      // In production (App Hosting), Firebase Admin is auto-initialized
      adminApp = getApps()[0] || initializeApp();
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw error;
  }

  return adminApp;
}

/**
 * Get authenticated Firestore instance
 */
export function getAdminFirestore() {
  if (!adminDb) {
    const app = getAdminApp();
    adminDb = getFirestore(app);
  }
  return adminDb;
}

/**
 * Get authenticated Firebase Auth instance
 */
export function getAdminAuth() {
  if (!adminAuth) {
    const app = getAdminApp();
    adminAuth = getAuth(app);
  }
  return adminAuth;
}

/**
 * Verify Firebase ID token and return user
 */
export async function verifyIdToken(token: string) {
  const auth = getAdminAuth();
  return await auth.verifyIdToken(token);
}

/**
 * Get user by UID
 */
export async function getUser(uid: string) {
  const auth = getAdminAuth();
  return await auth.getUser(uid);
}

// Export convenience references
export const adminDb_instance = getAdminFirestore;
export const adminAuth_instance = getAdminAuth;
