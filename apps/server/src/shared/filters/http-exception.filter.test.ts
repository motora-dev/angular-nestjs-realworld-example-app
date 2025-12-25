import { ERROR_CODE } from '@monorepo/error-code';
import { ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { vi, type MockInstance } from 'vitest';

import { BadRequestError, ForbiddenError, InternalServerError, NotFoundError, UnauthorizedError } from '$errors';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockRequest: any;
  let mockResponse: any;
  let loggerErrorSpy: MockInstance;
  let loggerWarnSpy: MockInstance;
  let loggerLogSpy: MockInstance;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    mockRequest = {
      id: 'test-request-id',
      originalUrl: '/test/endpoint',
      url: '/test/endpoint',
      method: 'GET',
      user: {
        id: 'test-user-id',
      },
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockArgumentsHost = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(mockRequest),
        getResponse: vi.fn().mockReturnValue(mockResponse),
      }),
    } as unknown as ArgumentsHost;

    // Spy on Logger.prototype methods to suppress log output during tests
    loggerErrorSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    loggerWarnSpy = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    loggerLogSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    loggerErrorSpy.mockRestore();
    loggerWarnSpy.mockRestore();
    loggerLogSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('AppError handling', () => {
    it('should handle BadRequestError with status 400', () => {
      const error = new BadRequestError(ERROR_CODE.VALIDATION_ERROR);

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: ERROR_CODE.VALIDATION_ERROR,
        message: ERROR_CODE.VALIDATION_ERROR,
        params: undefined,
      });
    });

    it('should handle BadRequestError with params', () => {
      const params = { field: 'email', value: 123 };
      const error = new BadRequestError(ERROR_CODE.VALIDATION_ERROR, params);

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: ERROR_CODE.VALIDATION_ERROR,
        message: ERROR_CODE.VALIDATION_ERROR,
        params,
      });
    });

    it('should handle UnauthorizedError with status 401', () => {
      const error = new UnauthorizedError(ERROR_CODE.UNAUTHORIZED);

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: ERROR_CODE.UNAUTHORIZED,
        message: ERROR_CODE.UNAUTHORIZED,
        params: undefined,
      });
    });

    it('should handle ForbiddenError with status 403', () => {
      const error = new ForbiddenError(ERROR_CODE.FORBIDDEN);

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: ERROR_CODE.FORBIDDEN,
        message: ERROR_CODE.FORBIDDEN,
        params: undefined,
      });
    });

    it('should handle NotFoundError with status 404', () => {
      const error = new NotFoundError(ERROR_CODE.USER_NOT_FOUND);

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: ERROR_CODE.USER_NOT_FOUND,
        message: ERROR_CODE.USER_NOT_FOUND,
        params: undefined,
      });
    });

    it('should handle InternalServerError with status 500', () => {
      const error = new InternalServerError(ERROR_CODE.INTERNAL_SERVER_ERROR);

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: ERROR_CODE.INTERNAL_SERVER_ERROR,
        message: ERROR_CODE.INTERNAL_SERVER_ERROR,
        params: undefined,
      });
    });
  });

  describe('HttpException handling', () => {
    it('should handle HttpException with string response', () => {
      const error = new HttpException('Bad Request Message', HttpStatus.BAD_REQUEST);

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: '',
        message: 'Bad Request Message',
        params: undefined,
      });
    });

    it('should handle HttpException with object response', () => {
      const error = new HttpException({ message: 'Validation failed' }, HttpStatus.UNPROCESSABLE_ENTITY);

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: '',
        message: 'Validation failed',
        params: undefined,
      });
    });

    it('should handle HttpException with NotFoundException', () => {
      const error = new HttpException('Resource not found', HttpStatus.NOT_FOUND);

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: '',
        message: 'Resource not found',
        params: undefined,
      });
    });
  });

  describe('Unexpected error handling', () => {
    it('should handle unknown Error with status 500', () => {
      const error = new Error('Something went wrong');

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: ERROR_CODE.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
        params: undefined,
      });
    });

    it('should handle non-Error objects with status 500', () => {
      const error = { some: 'object' };

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: ERROR_CODE.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
        params: undefined,
      });
    });

    it('should handle string errors with status 500', () => {
      const error = 'string error';

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: ERROR_CODE.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
        params: undefined,
      });
    });
  });

  describe('Production environment handling', () => {
    it('should mask error code for 5xx errors in production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      const params = { detail: 'sensitive info' };
      const error = new InternalServerError(ERROR_CODE.INTERNAL_SERVER_ERROR, params);

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: ERROR_CODE.INTERNAL_SERVER_ERROR,
        message: ERROR_CODE.INTERNAL_SERVER_ERROR,
        params: undefined,
      });
    });

    it('should mask params for 5xx HttpException in production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      const error = new HttpException('Internal error', HttpStatus.INTERNAL_SERVER_ERROR);

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: ERROR_CODE.INTERNAL_SERVER_ERROR,
        message: 'Internal error',
        params: undefined,
      });
    });

    it('should NOT mask error code for 4xx errors in production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      const params = { field: 'email' };
      const error = new BadRequestError(ERROR_CODE.VALIDATION_ERROR, params);

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: ERROR_CODE.VALIDATION_ERROR,
        message: ERROR_CODE.VALIDATION_ERROR,
        params,
      });
    });

    it('should NOT mask error code in development environment', () => {
      vi.stubEnv('NODE_ENV', 'development');
      const params = { detail: 'debug info' };
      const error = new InternalServerError(ERROR_CODE.INTERNAL_SERVER_ERROR, params);

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errorCode: ERROR_CODE.INTERNAL_SERVER_ERROR,
        message: ERROR_CODE.INTERNAL_SERVER_ERROR,
        params,
      });
    });
  });
});
