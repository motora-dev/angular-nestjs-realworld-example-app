import { describe, expect, it } from 'vitest';

import { DEFAULT_ERROR_KEY, getErrorCodeKey } from './error-code-keys';

describe('error-code-keys', () => {
  describe('DEFAULT_ERROR_KEY', () => {
    it('should have the correct default error key', () => {
      expect(DEFAULT_ERROR_KEY).toBe('errorCodes.UNEXPECTED_ERROR');
    });
  });

  describe('getErrorCodeKey', () => {
    it('should return translation key for error code', () => {
      expect(getErrorCodeKey('NOT_FOUND')).toBe('errorCodes.NOT_FOUND');
    });

    it('should return translation key for different error codes', () => {
      expect(getErrorCodeKey('UNAUTHORIZED')).toBe('errorCodes.UNAUTHORIZED');
      expect(getErrorCodeKey('FORBIDDEN')).toBe('errorCodes.FORBIDDEN');
      expect(getErrorCodeKey('INTERNAL_SERVER_ERROR')).toBe('errorCodes.INTERNAL_SERVER_ERROR');
    });

    it('should handle empty string', () => {
      expect(getErrorCodeKey('')).toBe('errorCodes.');
    });
  });
});
