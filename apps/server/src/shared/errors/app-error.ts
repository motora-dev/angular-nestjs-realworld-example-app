import { ERROR_CODE } from '@monorepo/error-code';

import type {
  ErrorCode,
  BadRequestCode,
  ConflictCode,
  ForbiddenCode,
  InternalServerErrorCode,
  NotFoundCode,
  UnauthorizedCode,
  ValidationErrorCode,
} from '@monorepo/error-code';

/**
 * Application-specific business logic error custom exception class.
 * Intended to be used in domain/service layer without HTTP layer dependency.
 */

/**
 * Error parameters for i18n interpolation
 */
export type ErrorParams = Record<string, string | number>;

// 1. Base class for all application errors
export abstract class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly params?: ErrorParams,
  ) {
    super(code);
    this.name = 'AppError';
  }
}

// 2. Category-specific exceptions (corresponding to HTTP status codes)

// Use for 400 Bad Request errors
export class BadRequestError extends AppError {
  constructor(code: BadRequestCode, params?: ErrorParams) {
    super(code, params);
    this.name = 'BadRequestError';
  }
}

// Use for 401 Unauthorized errors
export class UnauthorizedError extends AppError {
  constructor(code: UnauthorizedCode, params?: ErrorParams) {
    super(code, params);
    this.name = 'UnauthorizedError';
  }
}

// Use for 403 Forbidden errors
export class ForbiddenError extends AppError {
  constructor(code: ForbiddenCode, params?: ErrorParams) {
    super(code, params);
    this.name = 'ForbiddenError';
  }
}

// Use for 409 Conflict errors
export class ConflictError extends AppError {
  constructor(code: ConflictCode, params?: ErrorParams) {
    super(code, params);
    this.name = 'ConflictError';
  }
}

// Use for 404 Not Found errors
export class NotFoundError extends AppError {
  constructor(code: NotFoundCode, params?: ErrorParams) {
    super(code, params);
    this.name = 'NotFoundError';
  }
}

// Use for 500 Internal Server errors
export class InternalServerError extends AppError {
  constructor(code: InternalServerErrorCode, params?: ErrorParams) {
    super(code, params);
    this.name = 'InternalServerError';
  }
}

// 3. Validation error types (for 422 Unprocessable Entity)

/**
 * Validation field error for GitHub-style error response
 */
export interface ValidationFieldError {
  field: string;
  code: ValidationErrorCode;
}

// Use for 422 Unprocessable Entity errors (validation errors)
export class UnprocessableEntityError extends AppError {
  constructor(public readonly errors: ValidationFieldError[]) {
    super(ERROR_CODE.VALIDATION_ERROR);
    this.name = 'UnprocessableEntityError';
  }
}
