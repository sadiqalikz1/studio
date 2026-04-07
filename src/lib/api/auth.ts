import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Extract Bearer token from Authorization header
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Verify Firebase ID token and return decoded token
 */
export async function verifyAuth(request: NextRequest): Promise<DecodedIdToken | null> {
  const token = extractToken(request);
  if (!token) {
    return null;
  }

  try {
    const decodedToken = await verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Middleware to require authentication
 * Returns null if auth is valid, otherwise returns error response
 */
export async function requireAuth(request: NextRequest): Promise<DecodedIdToken> {
  const decodedToken = await verifyAuth(request);
  if (!decodedToken) {
    throw new AuthError('Unauthorized - Missing or invalid token', 401);
  }
  return decodedToken;
}

/**
 * Custom error class for auth errors
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Custom error class for server errors
 */
export class ServerError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'ServerError';
  }
}
