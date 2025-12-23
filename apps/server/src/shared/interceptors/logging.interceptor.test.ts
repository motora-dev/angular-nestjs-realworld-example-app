import { CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { vi, type MockInstance } from 'vitest';

import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockRequest: any;
  let mockResponse: any;
  let loggerLogSpy: MockInstance;

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

    // Spy on Logger.prototype.log
    loggerLogSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    loggerLogSpy.mockRestore();
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
            expect(loggerLogSpy).toHaveBeenCalledTimes(2);

            // Check request log
            const requestLog = JSON.parse(loggerLogSpy.mock.calls[0][0]);
            expect(requestLog.message).toBe('Request received');
            expect(requestLog.requestId).toBe('test-request-id');
            expect(requestLog.endpoint).toBe('/test/endpoint');
            expect(requestLog.method).toBe('GET');
            expect(requestLog.ip).toBe('127.0.0.1');
            expect(requestLog.userAgent).toBe('test-agent');

            // Check response log
            const responseLog = JSON.parse(loggerLogSpy.mock.calls[1][0]);
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

    it('should handle request without originalUrl', () => {
      mockRequest.originalUrl = undefined;
      mockRequest.url = '/fallback/url';

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const requestLog = JSON.parse(loggerLogSpy.mock.calls[0][0]);
      expect(requestLog.endpoint).toBe('/fallback/url');
    });

    it('should handle request with IP from socket.remoteAddress', () => {
      mockRequest.ip = undefined;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const requestLog = JSON.parse(loggerLogSpy.mock.calls[0][0]);
      expect(requestLog.ip).toBe('192.168.1.1');
    });

    it('should handle request with socket but no remoteAddress', () => {
      mockRequest.ip = undefined;
      mockRequest.socket = {}; // socket exists but has no remoteAddress

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const requestLog = JSON.parse(loggerLogSpy.mock.calls[0][0]);
      expect(requestLog.ip).toBe('10.0.0.1'); // falls back to x-forwarded-for
    });

    it('should handle request with IP from x-forwarded-for header', () => {
      mockRequest.ip = undefined;
      mockRequest.socket = undefined;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const requestLog = JSON.parse(loggerLogSpy.mock.calls[0][0]);
      expect(requestLog.ip).toBe('10.0.0.1');
    });

    it('should handle request without any IP source', () => {
      mockRequest.ip = undefined;
      mockRequest.socket = undefined;
      mockRequest.headers['x-forwarded-for'] = undefined;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const requestLog = JSON.parse(loggerLogSpy.mock.calls[0][0]);
      expect(requestLog.ip).toBeUndefined();
    });

    it('should handle request without user', () => {
      mockRequest.user = undefined;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const responseLog = JSON.parse(loggerLogSpy.mock.calls[1][0]);
      expect(responseLog.userId).toBeUndefined();
    });

    it('should handle response without statusCode', () => {
      mockResponse.statusCode = undefined;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const responseLog = JSON.parse(loggerLogSpy.mock.calls[1][0]);
      expect(responseLog.statusCode).toBe(200);
    });

    it('should handle request with null user', () => {
      mockRequest.user = null;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const responseLog = JSON.parse(loggerLogSpy.mock.calls[1][0]);
      expect(responseLog.userId).toBeUndefined();
    });

    it('should handle response with user but without id', () => {
      mockRequest.user = {}; // user exists but has no id property

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const responseLog = JSON.parse(loggerLogSpy.mock.calls[1][0]);
      expect(responseLog.userId).toBeUndefined();
    });

    it('should handle response with user having undefined id', () => {
      mockRequest.user = { id: undefined }; // user exists but id is explicitly undefined

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

      const responseLog = JSON.parse(loggerLogSpy.mock.calls[1][0]);
      expect(responseLog.userId).toBeUndefined();
    });
  });
});
