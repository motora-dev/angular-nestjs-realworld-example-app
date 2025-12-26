/** Default error translation key for unexpected errors */
export const DEFAULT_ERROR_KEY = 'errorCodes.UNEXPECTED_ERROR';

/**
 * Get translation key for an error code.
 * Since all error codes are guaranteed to have translations (verified by sync tests),
 * we always return the corresponding translation key.
 */
export const getErrorCodeKey = (code: string): string => `errorCodes.${code}`;
