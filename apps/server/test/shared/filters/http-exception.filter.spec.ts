import { ERROR_CODE } from '@monorepo/error-code';
import { Logger, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi, type MockInstance } from 'vitest';

import { HttpExceptionControllerMock } from './http-exception.controller.mock';

import type { INestApplication } from '@nestjs/common';

import { HttpExceptionFilter } from '$filters';

@Module({
  controllers: [HttpExceptionControllerMock],
})
class TestModule {}

describe('HttpExceptionFilter E2E', () => {
  let app: INestApplication;
  let baseUrl: string;
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
    // Spy on Logger.prototype.error
    loggerErrorSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('AppError handling', () => {
    it('should return 400 for BadRequestError', async () => {
      const response = await fetch(`${baseUrl}/http-exception/bad-request`);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.VALIDATION_ERROR);
      expect(body.message).toBe(ERROR_CODE.VALIDATION_ERROR);
      expect(body.params).toEqual({ field: 'filename' });
    });

    it('should return 401 for UnauthorizedError', async () => {
      const response = await fetch(`${baseUrl}/http-exception/unauthorized`);

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.UNAUTHORIZED);
      expect(body.message).toBe(ERROR_CODE.UNAUTHORIZED);
    });

    it('should return 403 for ForbiddenError', async () => {
      const response = await fetch(`${baseUrl}/http-exception/forbidden`);

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.FORBIDDEN);
      expect(body.message).toBe(ERROR_CODE.FORBIDDEN);
      expect(body.params).toEqual({ articleId: 'abc123' });
    });

    it('should return 404 for NotFoundError', async () => {
      const response = await fetch(`${baseUrl}/http-exception/not-found`);

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.USER_NOT_FOUND);
      expect(body.message).toBe(ERROR_CODE.USER_NOT_FOUND);
      expect(body.params).toEqual({ userId: 'user-123' });
    });

    it('should return 500 for InternalServerError', async () => {
      const response = await fetch(`${baseUrl}/http-exception/internal-server-error`);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.INTERNAL_SERVER_ERROR);
      expect(body.message).toBe(ERROR_CODE.INTERNAL_SERVER_ERROR);
    });
  });

  describe('HttpException handling', () => {
    it('should return 400 for NestJS HttpException', async () => {
      const response = await fetch(`${baseUrl}/http-exception/http-exception`);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.errorCode).toBe('');
      expect(body.message).toBe('Bad Request from HttpException');
    });
  });

  describe('Unexpected error handling', () => {
    it('should return 500 for unexpected Error', async () => {
      const response = await fetch(`${baseUrl}/http-exception/unexpected`);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.INTERNAL_SERVER_ERROR);
      expect(body.message).toBe('An unexpected error occurred');
    });
  });

  describe('Production environment handling', () => {
    it('should mask error code for 5xx errors in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');

      const response = await fetch(`${baseUrl}/http-exception/internal-server-error`);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.INTERNAL_SERVER_ERROR);
      expect(body.params).toBeUndefined();

      vi.unstubAllEnvs();
    });
  });

  describe('Error logging', () => {
    it('should log error with correct structure for AppError', async () => {
      await fetch(`${baseUrl}/http-exception/bad-request`);

      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(loggerErrorSpy.mock.calls[0][0]);

      expect(loggedData.timestamp).toBeDefined();
      expect(loggedData.message).toBe('Request failed with status 400');
      expect(loggedData.statusCode).toBe(400);
      expect(loggedData.errorCode).toBe(ERROR_CODE.VALIDATION_ERROR);
      expect(loggedData.endpoint).toBe('/http-exception/bad-request');
      expect(loggedData.method).toBe('GET');
    });

    it('should log error with stack trace for Error instances', async () => {
      await fetch(`${baseUrl}/http-exception/unexpected`);

      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(loggerErrorSpy.mock.calls[0][0]);

      expect(loggedData.timestamp).toBeDefined();
      expect(loggedData.message).toBe('Request failed with status 500');
      expect(loggedData.statusCode).toBe(500);
      expect(loggedData.stack).toBeDefined();
    });

    it('should log error for HttpException', async () => {
      await fetch(`${baseUrl}/http-exception/http-exception`);

      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(loggerErrorSpy.mock.calls[0][0]);

      expect(loggedData.timestamp).toBeDefined();
      expect(loggedData.message).toBe('Request failed with status 400');
      expect(loggedData.statusCode).toBe(400);
      expect(loggedData.error).toBe('Bad Request from HttpException');
    });
  });
});
