import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AuthError, ValidationError, ServerError } from './auth';

/**
 * Success response wrapper
 */
export function successResponse<T>(data: T, statusCode = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: statusCode }
  );
}

/**
 * Error response wrapper
 */
export function errorResponse(
  message: string,
  statusCode = 500,
  errors: Record<string, any> = {},
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(Object.keys(errors).length > 0 && { errors }),
    },
    { status: statusCode }
  );
}

/**
 * Handle API errors
 */
export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof AuthError) {
    return errorResponse(error.message, error.statusCode);
  }

  if (error instanceof ValidationError) {
    return errorResponse(error.message, 400, error.errors);
  }

  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(err.message);
    });
    return errorResponse('Validation failed', 400, fieldErrors);
  }

  if (error instanceof ServerError) {
    return errorResponse(error.message, 500);
  }

  if (error instanceof Error) {
    return errorResponse(error.message, 500);
  }

  return errorResponse('An unexpected error occurred', 500);
}

/**
 * Unauthorized error response
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return errorResponse(message, 401);
}

/**
 * Not found error response
 */
export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(message, 404);
}

/**
 * Bad request error response
 */
export function badRequestResponse(message = 'Bad request', errors: Record<string, any> = {}) {
  return errorResponse(message, 400, errors);
}
