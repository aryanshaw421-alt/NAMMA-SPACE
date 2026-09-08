/**
 * Standard API Response Structures for Namma Space
 */

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  error: null;
  // Backward compatibility keys (optional)
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  error: ApiErrorDetail;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function formatSuccessResponse<T extends object>(data: T, compatibilityKeys?: Record<string, unknown>): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    error: null,
    ...(compatibilityKeys || {}),
  };
}

export function formatErrorResponse(code: string, message: string, details?: unknown): ApiErrorResponse {
  return {
    success: false,
    data: null,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
}
