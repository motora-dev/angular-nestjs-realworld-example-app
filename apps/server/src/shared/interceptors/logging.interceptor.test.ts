import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { vi, type MockInstance } from 'vitest';

import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockRequest: any;
  let mockResponse: any;
  let consoleLogSpy: MockInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingInterceptor],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);

    // Mock request object
    mockRequest = {
      id: 'test-request-id',
      originalUrl: '/test/endpoint',
      url: '/test/endpoint',
      method: 'GET',
      ip: '127.0.0.1',
      socket: {
        remoteAddress: '192.168.1.1',
      },
      headers: {
        'user-agent': 'test-agent',
        'x-forwarded-for': '10.0.0.1',
      },
      user: {
        id: 'test-user-id',
      },
    };

    // Mock response object
    mockResponse = {
      statusCode: 200,
    };

    // Mock ExecutionContext
    mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(mockRequest),
        getResponse: vi.fn().mockReturnValue(mockResponse),
      }),
    } as any;

    // Mock CallHandler
    mockCallHandler = {
      handle: vi.fn().mockReturnValue(of('test-response')),
    };

    // Spy on console.log
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should log request and response on successful execution', () =>
      new Promise<void>((done) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          next: (result) => {
            expect(result).toBe('test-response');
            expect(consoleLogSpy).toHaveBeenCalledTimes(2);

            // Check request log
            const requestLog = JSON.parse(consoleLogSpy.mock.calls[0][0]);
            expect(requestLog.level).toBe('INFO');
            expect(requestLog.message).toBe('Request received');
            expect(requestLog.requestId).toBe('test-request-id');
            expect(requestLog.endpoint).toBe('/test/endpoint');
            expect(requestLog.method).toBe('GET');
            expect(requestLog.ip).toBe('127.0.0.1');
            expect(requestLog.userAgent).toBe('test-agent');

            // Check response log
            const responseLog = JSON.parse(consoleLogSpy.mock.calls[1][0]);
            expect(responseLog.level).toBe('INFO');
            expect(responseLog.message).toBe('Request completed successfully');
            expect(responseLog.requestId).toBe('test-request-id');
            expect(responseLog.userId).toBe('test-user-id');
            expect(responseLog.endpoint).toBe('/test/endpoint');
            expect(responseLog.method).toBe('GET');
            expect(responseLog.statusCode).toBe(200);

            done();
          },
        });
      }));

    it('should log request and error on failed execution', () =>
      new Promise<void>((done) => {
        const testError = {
          status: 400,
          message: 'Bad Request',
          stack: 'Error stack trace',
        };

        mockCallHandler.handle = vi.fn().mockReturnValue(throwError(() => testError));

        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: (error) => {
            expect(error).toBe(testError);
            expect(consoleLogSpy).toHaveBeenCalledTimes(2);

            // Check request log
            const requestLog = JSON.parse(consoleLogSpy.mock.calls[0][0]);
            expect(requestLog.level).toBe('INFO');
            expect(requestLog.message).toBe('Request received');

            // Check error log
            const errorLog = JSON.parse(consoleLogSpy.mock.calls[1][0]);
            expect(errorLog.level).toBe('ERROR');
            expect(errorLog.message).toBe('Request failed with status 400');
            expect(errorLog.requestId).toBe('test-request-id');
            expect(errorLog.userId).toBe('test-user-id');
            expect(errorLog.endpoint).toBe('/test/endpoint');
            expect(errorLog.method).toBe('GET');
            expect(errorLog.statusCode).toBe(400);
            expect(errorLog.error).toBe('Bad Request');
            expect(errorLog.stack).toBe('Error stack trace');

            done();
          },
        });
      }));

    it('should handle error without status code', () =>
      new Promise<void>((done) => {
        const testError = {
          message: 'Internal Server Error',
        };

        mockCallHandler.handle = vi.fn().mockReturnValue(throwError(() => testError));

        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: () => {
            const errorLog = JSON.parse(consoleLogSpy.mock.calls[1][0]);
            expect(errorLog.statusCode).toBe(500);
            expect(errorLog.error).toBe('Internal Server Error');
            done();
          },
        });
      }));

    it('should handle error with statusCode instead of status', () =>
      new Promise<void>((done) => {
        const testError = {
          statusCode: 404,
          message: 'Not Found',
        };

        mockCallHandler.handle = vi.fn().mockReturnValue(throwError(() => testError));

        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: () => {
            const errorLog = JSON.parse(consoleLogSpy.mock.calls[1][0]);
            expect(errorLog.statusCode).toBe(404);
            done();
          },
        });
      }));

    it('should handle error without message', () =>
      new Promise<void>((done) => {
        const testError = {
          status: 500,
        };

        mockCallHandler.handle = vi.fn().mockReturnValue(throwError(() => testError));

        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: () => {
            const errorLog = JSON.parse(consoleLogSpy.mock.calls[1][0]);
            expect(errorLog.error).toBe('Unknown error occurred');
            done();
          },
        });
      }));

    it('should handle request without originalUrl', () => {
      mockRequest.originalUrl = undefined;
      mockRequest.url = '/fallback/url';

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const requestLog = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(requestLog.endpoint).toBe('/fallback/url');
    });

    it('should handle request with IP from socket.remoteAddress', () => {
      mockRequest.ip = undefined;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const requestLog = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(requestLog.ip).toBe('192.168.1.1');
    });

    it('should handle request with socket but no remoteAddress', () => {
      mockRequest.ip = undefined;
      mockRequest.socket = {}; // socket exists but has no remoteAddress

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const requestLog = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(requestLog.ip).toBe('10.0.0.1'); // falls back to x-forwarded-for
    });

    it('should handle request with IP from x-forwarded-for header', () => {
      mockRequest.ip = undefined;
      mockRequest.socket = undefined;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const requestLog = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(requestLog.ip).toBe('10.0.0.1');
    });

    it('should handle request without any IP source', () => {
      mockRequest.ip = undefined;
      mockRequest.socket = undefined;
      mockRequest.headers['x-forwarded-for'] = undefined;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const requestLog = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(requestLog.ip).toBeUndefined();
    });

    it('should handle request without user', () => {
      mockRequest.user = undefined;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const responseLog = JSON.parse(consoleLogSpy.mock.calls[1][0]);
      expect(responseLog.userId).toBeUndefined();
    });

    it('should handle error logging without user', () =>
      new Promise<void>((done) => {
        mockRequest.user = undefined;
        const testError = {
          status: 500,
          message: 'Internal Server Error',
          stack: 'Error stack trace',
        };

        mockCallHandler.handle = vi.fn().mockReturnValue(throwError(() => testError));

        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: () => {
            const errorLog = JSON.parse(consoleLogSpy.mock.calls[1][0]);
            expect(errorLog.userId).toBeUndefined();
            done();
          },
        });
      }));

    it('should handle error logging with user but without id', () =>
      new Promise<void>((done) => {
        mockRequest.user = {}; // user exists but has no id property
        const testError = {
          status: 500,
          message: 'Internal Server Error',
          stack: 'Error stack trace',
        };

        mockCallHandler.handle = vi.fn().mockReturnValue(throwError(() => testError));

        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: () => {
            const errorLog = JSON.parse(consoleLogSpy.mock.calls[1][0]);
            expect(errorLog.userId).toBeUndefined();
            done();
          },
        });
      }));

    it('should handle error logging with user having undefined id', () =>
      new Promise<void>((done) => {
        mockRequest.user = { id: undefined }; // user exists but id is explicitly undefined
        const testError = {
          status: 500,
          message: 'Internal Server Error',
          stack: 'Error stack trace',
        };
        mockRequest.originalUrl = undefined;
        mockRequest.url = '/fallback/url';
        mockCallHandler.handle = vi.fn().mockReturnValue(throwError(() => testError));

        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: () => {
            const errorLog = JSON.parse(consoleLogSpy.mock.calls[1][0]);
            expect(errorLog.userId).toBeUndefined();
            done();
          },
        });
      }));

    it('should handle response without statusCode', () => {
      mockResponse.statusCode = undefined;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const responseLog = JSON.parse(consoleLogSpy.mock.calls[1][0]);
      expect(responseLog.statusCode).toBe(200);
    });

    it('should handle request with null user', () => {
      mockRequest.user = null;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const responseLog = JSON.parse(consoleLogSpy.mock.calls[1][0]);
      expect(responseLog.userId).toBeUndefined();
    });

    it('should handle error logging with null user', () =>
      new Promise<void>((done) => {
        mockRequest.user = null;
        const testError = {
          status: 500,
          message: 'Internal Server Error',
          stack: 'Error stack trace',
        };

        mockCallHandler.handle = vi.fn().mockReturnValue(throwError(() => testError));

        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: () => {
            const errorLog = JSON.parse(consoleLogSpy.mock.calls[1][0]);
            expect(errorLog.userId).toBeUndefined();
            done();
          },
        });
      }));

    it('should handle response with user but without id', () => {
      mockRequest.user = {}; // user exists but has no id property

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const responseLog = JSON.parse(consoleLogSpy.mock.calls[1][0]);
      expect(responseLog.userId).toBeUndefined();
    });

    it('should handle response with user having undefined id', () => {
      mockRequest.user = { id: undefined }; // user exists but id is explicitly undefined

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const responseLog = JSON.parse(consoleLogSpy.mock.calls[1][0]);
      expect(responseLog.userId).toBeUndefined();
    });
  });
});
