import { describe, expect, it } from 'vitest';

import {
  ERROR_CODE,
  type BadRequestCode,
  type ConflictCode,
  type ErrorCode,
  type ForbiddenCode,
  type InternalServerErrorCode,
  type NotFoundCode,
  type UnauthorizedCode,
  type ValidationErrorCode,
} from './error-code';

describe('ERROR_CODE', () => {
  it('should be defined', () => {
    expect(ERROR_CODE).toBeDefined();
  });

  describe('System errors', () => {
    it('should have INTERNAL_SERVER_ERROR', () => {
      expect(ERROR_CODE.INTERNAL_SERVER_ERROR).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('Auth errors', () => {
    it('should have UNAUTHORIZED', () => {
      expect(ERROR_CODE.UNAUTHORIZED).toBe('UNAUTHORIZED');
    });

    it('should have FORBIDDEN', () => {
      expect(ERROR_CODE.FORBIDDEN).toBe('FORBIDDEN');
    });
  });

  describe('User errors', () => {
    it('should have USER_NOT_FOUND', () => {
      expect(ERROR_CODE.USER_NOT_FOUND).toBe('USER_NOT_FOUND');
    });

    it('should have EMAIL_ALREADY_EXISTS', () => {
      expect(ERROR_CODE.EMAIL_ALREADY_EXISTS).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should have USERNAME_ALREADY_EXISTS', () => {
      expect(ERROR_CODE.USERNAME_ALREADY_EXISTS).toBe('USERNAME_ALREADY_EXISTS');
    });
  });

  describe('Article errors', () => {
    it('should have ARTICLE_NOT_FOUND', () => {
      expect(ERROR_CODE.ARTICLE_NOT_FOUND).toBe('ARTICLE_NOT_FOUND');
    });
  });

  describe('Comment errors', () => {
    it('should have COMMENT_NOT_FOUND', () => {
      expect(ERROR_CODE.COMMENT_NOT_FOUND).toBe('COMMENT_NOT_FOUND');
    });
  });

  describe('Validation errors', () => {
    it('should have VALIDATION_ERROR', () => {
      expect(ERROR_CODE.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    });

    it('should have USERNAME_REQUIRED', () => {
      expect(ERROR_CODE.USERNAME_REQUIRED).toBe('USERNAME_REQUIRED');
    });

    it('should have USERNAME_TOO_SHORT', () => {
      expect(ERROR_CODE.USERNAME_TOO_SHORT).toBe('USERNAME_TOO_SHORT');
    });

    it('should have USERNAME_INVALID_FORMAT', () => {
      expect(ERROR_CODE.USERNAME_INVALID_FORMAT).toBe('USERNAME_INVALID_FORMAT');
    });

    it('should have EMAIL_INVALID', () => {
      expect(ERROR_CODE.EMAIL_INVALID).toBe('EMAIL_INVALID');
    });

    it('should have TITLE_REQUIRED', () => {
      expect(ERROR_CODE.TITLE_REQUIRED).toBe('TITLE_REQUIRED');
    });

    it('should have DESCRIPTION_REQUIRED', () => {
      expect(ERROR_CODE.DESCRIPTION_REQUIRED).toBe('DESCRIPTION_REQUIRED');
    });

    it('should have BODY_REQUIRED', () => {
      expect(ERROR_CODE.BODY_REQUIRED).toBe('BODY_REQUIRED');
    });

    it('should have COMMENT_BODY_REQUIRED', () => {
      expect(ERROR_CODE.COMMENT_BODY_REQUIRED).toBe('COMMENT_BODY_REQUIRED');
    });
  });

  it('should have all expected error codes', () => {
    const expectedCodes = [
      'INTERNAL_SERVER_ERROR',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'USER_NOT_FOUND',
      'EMAIL_ALREADY_EXISTS',
      'USERNAME_ALREADY_EXISTS',
      'ARTICLE_NOT_FOUND',
      'COMMENT_NOT_FOUND',
      'VALIDATION_ERROR',
      'USERNAME_REQUIRED',
      'USERNAME_TOO_SHORT',
      'USERNAME_INVALID_FORMAT',
      'EMAIL_INVALID',
      'TITLE_REQUIRED',
      'DESCRIPTION_REQUIRED',
      'BODY_REQUIRED',
      'COMMENT_BODY_REQUIRED',
    ];

    const actualCodes = Object.values(ERROR_CODE);
    expect(actualCodes).toEqual(expect.arrayContaining(expectedCodes));
    expect(actualCodes.length).toBe(expectedCodes.length);
  });
});

describe('Type definitions', () => {
  describe('ErrorCode', () => {
    it('should accept all ERROR_CODE values', () => {
      const codes: ErrorCode[] = [
        'INTERNAL_SERVER_ERROR',
        'UNAUTHORIZED',
        'FORBIDDEN',
        'USER_NOT_FOUND',
        'EMAIL_ALREADY_EXISTS',
        'USERNAME_ALREADY_EXISTS',
        'ARTICLE_NOT_FOUND',
        'COMMENT_NOT_FOUND',
        'VALIDATION_ERROR',
        'USERNAME_REQUIRED',
        'USERNAME_TOO_SHORT',
        'USERNAME_INVALID_FORMAT',
        'EMAIL_INVALID',
        'TITLE_REQUIRED',
        'DESCRIPTION_REQUIRED',
        'BODY_REQUIRED',
        'COMMENT_BODY_REQUIRED',
      ];

      expect(codes).toBeDefined();
    });
  });

  describe('InternalServerErrorCode', () => {
    it('should accept valid internal server error codes', () => {
      const codes: InternalServerErrorCode[] = [ERROR_CODE.INTERNAL_SERVER_ERROR];

      expect(codes).toBeDefined();
    });
  });

  describe('NotFoundCode', () => {
    it('should accept valid not found error codes', () => {
      const codes: NotFoundCode[] = [
        ERROR_CODE.USER_NOT_FOUND,
        ERROR_CODE.ARTICLE_NOT_FOUND,
        ERROR_CODE.COMMENT_NOT_FOUND,
      ];

      expect(codes).toBeDefined();
    });
  });

  describe('ForbiddenCode', () => {
    it('should accept valid forbidden error codes', () => {
      const codes: ForbiddenCode[] = [ERROR_CODE.FORBIDDEN];

      expect(codes).toBeDefined();
    });
  });

  describe('BadRequestCode', () => {
    it('should accept valid bad request error codes', () => {
      const codes: BadRequestCode[] = [ERROR_CODE.VALIDATION_ERROR];

      expect(codes).toBeDefined();
    });
  });

  describe('UnauthorizedCode', () => {
    it('should accept valid unauthorized error codes', () => {
      const codes: UnauthorizedCode[] = [ERROR_CODE.UNAUTHORIZED];

      expect(codes).toBeDefined();
    });
  });

  describe('ConflictCode', () => {
    it('should accept valid conflict error codes', () => {
      const codes: ConflictCode[] = [ERROR_CODE.EMAIL_ALREADY_EXISTS, ERROR_CODE.USERNAME_ALREADY_EXISTS];

      expect(codes).toBeDefined();
    });
  });

  describe('ValidationErrorCode', () => {
    it('should accept valid validation error codes', () => {
      const codes: ValidationErrorCode[] = [
        ERROR_CODE.USERNAME_REQUIRED,
        ERROR_CODE.USERNAME_TOO_SHORT,
        ERROR_CODE.USERNAME_INVALID_FORMAT,
        ERROR_CODE.EMAIL_INVALID,
        ERROR_CODE.TITLE_REQUIRED,
        ERROR_CODE.DESCRIPTION_REQUIRED,
        ERROR_CODE.BODY_REQUIRED,
        ERROR_CODE.COMMENT_BODY_REQUIRED,
      ];

      expect(codes).toBeDefined();
    });
  });
});
