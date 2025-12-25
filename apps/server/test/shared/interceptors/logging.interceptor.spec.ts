import { Logger, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { vi, type MockInstance } from 'vitest';

import { LoggingControllerMock } from './logging.controller.mock';

import type { INestApplication } from '@nestjs/common';

import { HttpExceptionFilter } from '$filters';
import { LoggingInterceptor } from '$interceptors';

@Module({
  controllers: [LoggingControllerMock],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
class TestModule {}

describe('LoggingInterceptor E2E', () => {
  let app: INestApplication;
  let baseUrl: string;
  let loggerLogSpy: MockInstance;
  let loggerErrorSpy: MockInstance;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleFixture.createNestApplication({ logger: false });
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    await app.listen(0); // Start on random port

    const url = await app.getUrl();
    baseUrl = url;
  });

  beforeEach(() => {
    // Spy on Logger.prototype.log for interceptor logs
    loggerLogSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    // Spy on Logger.prototype.error for filter error logs
    loggerErrorSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    loggerLogSpy.mockRestore();
    loggerErrorSpy.mockRestore();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Success pattern', () => {
    it('should log request and response for successful requests', async () => {
      const response = await fetch(`${baseUrl}/logging/success`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ message: 'success' });

      // Should log twice: request log + response log
      expect(loggerLogSpy).toHaveBeenCalledTimes(2);

      // Check request log structure
      const requestLog = JSON.parse(loggerLogSpy.mock.calls[0][0]);
      expect(requestLog.timestamp).toBeDefined();
      expect(requestLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO format
      expect(requestLog.message).toBe('Request received');
      expect(requestLog.endpoint).toBe('/logging/success');
      expect(requestLog.method).toBe('GET');
      expect(requestLog.ip).toBeDefined();
      expect(requestLog.userAgent).toBeDefined();

      // Check response log structure
      const responseLog = JSON.parse(loggerLogSpy.mock.calls[1][0]);
      expect(responseLog.timestamp).toBeDefined();
      expect(responseLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO format
      expect(responseLog.message).toBe('Request completed successfully');
      expect(responseLog.endpoint).toBe('/logging/success');
      expect(responseLog.method).toBe('GET');
      expect(responseLog.statusCode).toBe(200);

      // No error logs should be emitted
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should include IP and user agent in request log', async () => {
      await fetch(`${baseUrl}/logging/success`, {
        headers: {
          'User-Agent': 'TestAgent/1.0',
        },
      });

      const requestLog = JSON.parse(loggerLogSpy.mock.calls[0][0]);
      expect(requestLog.userAgent).toBe('TestAgent/1.0');
      expect(requestLog.ip).toBeDefined();
      expect(typeof requestLog.ip).toBe('string');
    });

    it('should have consistent endpoint and method between request and response logs', async () => {
      await fetch(`${baseUrl}/logging/success`);

      const requestLog = JSON.parse(loggerLogSpy.mock.calls[0][0]);
      const responseLog = JSON.parse(loggerLogSpy.mock.calls[1][0]);

      // Endpoint and method should match between request and response logs
      expect(requestLog.endpoint).toBe(responseLog.endpoint);
      expect(requestLog.method).toBe(responseLog.method);
    });
  });

  describe('Error pattern', () => {
    it('should log only request for failed requests (error logged by filter)', async () => {
      const response = await fetch(`${baseUrl}/logging/error`);

      expect(response.status).toBe(404);

      // Interceptor logs request, HttpExceptionFilter logs error (both use logger.log for 404)
      // Request log (from interceptor) + Error log (from filter at info level for 404)
      expect(loggerLogSpy).toHaveBeenCalledTimes(2);

      // Check request log structure (first call)
      const requestLog = JSON.parse(loggerLogSpy.mock.calls[0][0]);
      expect(requestLog.timestamp).toBeDefined();
      expect(requestLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO format
      expect(requestLog.message).toBe('Request received');
      expect(requestLog.endpoint).toBe('/logging/error');
      expect(requestLog.method).toBe('GET');
      expect(requestLog.ip).toBeDefined();
      expect(requestLog.userAgent).toBeDefined();

      // 404 errors are logged at info level (logger.log), not error level
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should log comprehensive error information via HttpExceptionFilter', async () => {
      await fetch(`${baseUrl}/logging/error`);

      // 404 errors are logged at info level (logger.log), not error level
      // Error log is the second call (after request log)
      const errorLog = JSON.parse(loggerLogSpy.mock.calls[1][0]);

      // Check error log structure
      expect(errorLog.timestamp).toBeDefined();
      expect(errorLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO format
      expect(errorLog.message).toBe('Request failed with status 404');
      expect(errorLog.endpoint).toBe('/logging/error');
      expect(errorLog.method).toBe('GET');
      expect(errorLog.statusCode).toBe(404);
      expect(errorLog.errorCode).toBe('USER_NOT_FOUND');
      expect(errorLog.error).toBe('USER_NOT_FOUND');
      expect(errorLog.stack).toBeDefined();
      expect(typeof errorLog.stack).toBe('string');
      expect(errorLog.stack).toContain('NotFoundError');
    });

    it('should not log response success message when error occurs', async () => {
      await fetch(`${baseUrl}/logging/error`);

      // Verify no "Request completed successfully" message was logged
      const allLogCalls = loggerLogSpy.mock.calls.map((call: string[]) => JSON.parse(call[0]));
      const successLogs = allLogCalls.filter(
        (log: { message: string }) => log.message === 'Request completed successfully',
      );

      expect(successLogs).toHaveLength(0);
    });

    it('should have consistent endpoint and method between request and error logs', async () => {
      await fetch(`${baseUrl}/logging/error`);

      // Request log is first, error log is second (both at info level for 404)
      const requestLog = JSON.parse(loggerLogSpy.mock.calls[0][0]);
      const errorLog = JSON.parse(loggerLogSpy.mock.calls[1][0]);

      // Endpoint and method should match between request and error logs
      expect(requestLog.endpoint).toBe(errorLog.endpoint);
      expect(requestLog.method).toBe(errorLog.method);
    });
  });
});
