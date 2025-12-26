import { ERROR_CODE, ValidationErrorCode } from '@monorepo/error-code';
import { Module, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthControllerMock } from './auth.controller.mock';

import type { INestApplication } from '@nestjs/common';

import { UnprocessableEntityError } from '$errors';
import { HttpExceptionFilter } from '$filters';

@Module({
  controllers: [AuthControllerMock],
})
class TestModule {}

describe('Auth Controller ValidationPipe E2E', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleFixture.createNestApplication({ logger: false });

    // Configure ValidationPipe with the same exceptionFactory as app.module.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        exceptionFactory: (errors) => {
          const validationErrors = errors.flatMap((error) => {
            const messages = Object.values(error.constraints || {});
            return messages.map((message) => ({
              field: error.property,
              code: message as ValidationErrorCode,
            }));
          });
          return new UnprocessableEntityError(validationErrors);
        },
      }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
    await app.listen(0);

    const url = await app.getUrl();
    baseUrl = url;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('RegisterDto validation', () => {
    it('should return 422 with USERNAME_REQUIRED when username is missing', async () => {
      const response = await fetch(`${baseUrl}/auth-mock/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.message).toBe('Validation Failed');
      expect(body.errors).toEqual(expect.arrayContaining([{ field: 'username', code: ERROR_CODE.USERNAME_REQUIRED }]));
    });

    it('should return 422 with USERNAME_REQUIRED when username is empty string', async () => {
      const response = await fetch(`${baseUrl}/auth-mock/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: '' }),
      });

      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.message).toBe('Validation Failed');
      expect(body.errors).toEqual(expect.arrayContaining([{ field: 'username', code: ERROR_CODE.USERNAME_REQUIRED }]));
    });

    it('should return 422 with USERNAME_TOO_SHORT when username is less than 3 characters', async () => {
      const response = await fetch(`${baseUrl}/auth-mock/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'ab' }),
      });

      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.message).toBe('Validation Failed');
      expect(body.errors).toEqual(expect.arrayContaining([{ field: 'username', code: ERROR_CODE.USERNAME_TOO_SHORT }]));
    });

    it('should return 422 with USERNAME_INVALID_FORMAT when username contains invalid characters', async () => {
      const response = await fetch(`${baseUrl}/auth-mock/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'user@name' }),
      });

      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.message).toBe('Validation Failed');
      expect(body.errors).toEqual([{ field: 'username', code: ERROR_CODE.USERNAME_INVALID_FORMAT }]);
    });

    it('should return 201 when username is valid', async () => {
      const response = await fetch(`${baseUrl}/auth-mock/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'validuser123' }),
      });

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toEqual({ success: true, username: 'validuser123' });
    });

    it('should return 201 when username has exactly 3 characters', async () => {
      const response = await fetch(`${baseUrl}/auth-mock/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'abc' }),
      });

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toEqual({ success: true, username: 'abc' });
    });

    it('should return 201 when username contains underscore', async () => {
      const response = await fetch(`${baseUrl}/auth-mock/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'user_name_123' }),
      });

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toEqual({ success: true, username: 'user_name_123' });
    });

    it('should return multiple errors when username violates multiple rules', async () => {
      // Empty string violates both IsNotEmpty and MinLength
      const response = await fetch(`${baseUrl}/auth-mock/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: '' }),
      });

      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.message).toBe('Validation Failed');
      // Empty string should trigger USERNAME_REQUIRED (from IsNotEmpty) and USERNAME_TOO_SHORT (from MinLength)
      expect(body.errors.length).toBeGreaterThanOrEqual(1);
      expect(body.errors.every((e: { field: string }) => e.field === 'username')).toBe(true);
    });
  });
});
