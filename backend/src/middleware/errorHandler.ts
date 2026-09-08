import { Request, Response, NextFunction } from 'express';
import { formatErrorResponse } from '../types/api.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, errorCode: string = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class NotImplementedError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 501, 'NOT_IMPLEMENTED', details);
  }
}

/**
 * Global Centralized Error Handling Middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const errorCode = isAppError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected internal error occurred';
  const details = isAppError ? err.details : undefined;

  // Development logging
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.originalUrl} - ${statusCode} [${errorCode}]: ${message}`);
    if (statusCode >= 500 && err.stack) {
      console.error(err.stack);
    }
  }

  // Never expose internal stack traces or database internals to client
  res.status(statusCode).json(formatErrorResponse(errorCode, message, details));
}

/**
 * 404 Catch-all Middleware for undefined routes
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
}
