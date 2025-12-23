import { ERROR_CODE } from '@monorepo/error-code';

import {
  AppError,
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from './app-error';

describe('AppError Classes', () => {
  describe('BadRequestError', () => {
    it('should be an instance of AppError', () => {
      const error = new BadRequestError(ERROR_CODE.VALIDATION_ERROR);

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct properties', () => {
      const error = new BadRequestError(ERROR_CODE.VALIDATION_ERROR);

      expect(error.code).toBe(ERROR_CODE.VALIDATION_ERROR);
      expect(error.name).toBe('BadRequestError');
      expect(error.message).toBe(ERROR_CODE.VALIDATION_ERROR);
      expect(error.params).toBeUndefined();
    });

    it('should store params when provided', () => {
      const params = { field: 'email', value: 123 };
      const error = new BadRequestError(ERROR_CODE.VALIDATION_ERROR, params);

      expect(error.params).toEqual(params);
    });

    it('should work with EMAIL_ALREADY_EXISTS code', () => {
      const error = new BadRequestError(ERROR_CODE.EMAIL_ALREADY_EXISTS);

      expect(error.code).toBe(ERROR_CODE.EMAIL_ALREADY_EXISTS);
      expect(error.name).toBe('BadRequestError');
    });

    it('should work with USERNAME_ALREADY_EXISTS code', () => {
      const error = new BadRequestError(ERROR_CODE.USERNAME_ALREADY_EXISTS);

      expect(error.code).toBe(ERROR_CODE.USERNAME_ALREADY_EXISTS);
      expect(error.name).toBe('BadRequestError');
    });
  });

  describe('UnauthorizedError', () => {
    it('should be an instance of AppError', () => {
      const error = new UnauthorizedError(ERROR_CODE.UNAUTHORIZED);

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct properties', () => {
      const error = new UnauthorizedError(ERROR_CODE.UNAUTHORIZED);

      expect(error.code).toBe(ERROR_CODE.UNAUTHORIZED);
      expect(error.name).toBe('UnauthorizedError');
      expect(error.message).toBe(ERROR_CODE.UNAUTHORIZED);
      expect(error.params).toBeUndefined();
    });

    it('should store params when provided', () => {
      const params = { reason: 'token_expired' };
      const error = new UnauthorizedError(ERROR_CODE.UNAUTHORIZED, params);

      expect(error.params).toEqual(params);
    });
  });

  describe('ForbiddenError', () => {
    it('should be an instance of AppError', () => {
      const error = new ForbiddenError(ERROR_CODE.FORBIDDEN);

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct properties', () => {
      const error = new ForbiddenError(ERROR_CODE.FORBIDDEN);

      expect(error.code).toBe(ERROR_CODE.FORBIDDEN);
      expect(error.name).toBe('ForbiddenError');
      expect(error.message).toBe(ERROR_CODE.FORBIDDEN);
      expect(error.params).toBeUndefined();
    });

    it('should store params when provided', () => {
      const params = { resourceId: 'abc123' };
      const error = new ForbiddenError(ERROR_CODE.FORBIDDEN, params);

      expect(error.params).toEqual(params);
    });
  });

  describe('NotFoundError', () => {
    it('should be an instance of AppError', () => {
      const error = new NotFoundError(ERROR_CODE.USER_NOT_FOUND);

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct properties', () => {
      const error = new NotFoundError(ERROR_CODE.USER_NOT_FOUND);

      expect(error.code).toBe(ERROR_CODE.USER_NOT_FOUND);
      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe(ERROR_CODE.USER_NOT_FOUND);
      expect(error.params).toBeUndefined();
    });

    it('should store params when provided', () => {
      const params = { userId: 'user-123' };
      const error = new NotFoundError(ERROR_CODE.USER_NOT_FOUND, params);

      expect(error.params).toEqual(params);
    });

    it('should work with ARTICLE_NOT_FOUND code', () => {
      const error = new NotFoundError(ERROR_CODE.ARTICLE_NOT_FOUND);

      expect(error.code).toBe(ERROR_CODE.ARTICLE_NOT_FOUND);
    });

    it('should work with COMMENT_NOT_FOUND code', () => {
      const error = new NotFoundError(ERROR_CODE.COMMENT_NOT_FOUND);

      expect(error.code).toBe(ERROR_CODE.COMMENT_NOT_FOUND);
    });
  });

  describe('InternalServerError', () => {
    it('should be an instance of AppError', () => {
      const error = new InternalServerError(ERROR_CODE.INTERNAL_SERVER_ERROR);

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct properties', () => {
      const error = new InternalServerError(ERROR_CODE.INTERNAL_SERVER_ERROR);

      expect(error.code).toBe(ERROR_CODE.INTERNAL_SERVER_ERROR);
      expect(error.name).toBe('InternalServerError');
      expect(error.message).toBe(ERROR_CODE.INTERNAL_SERVER_ERROR);
      expect(error.params).toBeUndefined();
    });

    it('should store params when provided', () => {
      const params = { detail: 'database connection failed' };
      const error = new InternalServerError(ERROR_CODE.INTERNAL_SERVER_ERROR, params);

      expect(error.params).toEqual(params);
    });
  });
});
