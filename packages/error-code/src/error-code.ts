/**
 * Application error codes for the RealWorld API.
 * These codes are used for type-safe error handling and i18n message resolution.
 */
export const ERROR_CODE = {
  // System
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',

  // Auth
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // User
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS: 'USERNAME_ALREADY_EXISTS',

  // Article
  ARTICLE_NOT_FOUND: 'ARTICLE_NOT_FOUND',

  // Comment
  COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

// --- Type definitions ---

/** All error codes */
export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

/** Error codes for 500 Internal Server Error */
export type InternalServerErrorCode = typeof ERROR_CODE.INTERNAL_SERVER_ERROR;

/** Error codes for 400 Bad Request */
export type BadRequestCode = typeof ERROR_CODE.VALIDATION_ERROR;

/** Error codes for 401 Unauthorized */
export type UnauthorizedCode = typeof ERROR_CODE.UNAUTHORIZED;

/** Error codes for 403 Forbidden */
export type ForbiddenCode = typeof ERROR_CODE.FORBIDDEN;

/** Error codes for 404 Not Found */
export type NotFoundCode =
  | typeof ERROR_CODE.USER_NOT_FOUND
  | typeof ERROR_CODE.ARTICLE_NOT_FOUND
  | typeof ERROR_CODE.COMMENT_NOT_FOUND;

/** Error codes for 409 Conflict */
export type ConflictCode = typeof ERROR_CODE.EMAIL_ALREADY_EXISTS | typeof ERROR_CODE.USERNAME_ALREADY_EXISTS;
