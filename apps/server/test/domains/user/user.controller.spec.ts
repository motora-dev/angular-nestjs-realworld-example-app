import { ERROR_CODE, ValidationErrorCode } from '@monorepo/error-code';
import { CanActivate, ExecutionContext, Logger, Module, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi, type MockInstance } from 'vitest';

import { PrismaAdapter } from '$adapters';
import type { CurrentUserType } from '$decorators';
import { UserModule } from '$domains/user/user.module';
import { UnprocessableEntityError } from '$errors';
import { HttpExceptionFilter } from '$filters';
import { GoogleAuthGuard } from '$modules/auth/guards';

import type { INestApplication } from '@nestjs/common';

@Module({
  imports: [UserModule],
})
class TestModule {}

// Custom guard to set authenticated user in request
class MockAuthGuard implements CanActivate {
  constructor(private readonly user: CurrentUserType) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.user = this.user;
    return true;
  }
}

describe('User Controller E2E', () => {
  let app: INestApplication;
  let baseUrl: string;
  let prismaAdapter: PrismaAdapter;
  let loggerErrorSpy: MockInstance;

  const mockCurrentUser: CurrentUserType = {
    id: 1,
    publicId: 'test-public-id',
    username: 'testuser',
  };

  const mockUser = {
    id: 1,
    publicId: 'test-public-id',
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Test bio',
    image: 'https://example.com/image.jpg',
  };

  beforeAll(async () => {
    const mockGuard = new MockAuthGuard(mockCurrentUser);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    })
      .overrideProvider(PrismaAdapter)
      .useValue({
        $connect: vi.fn(),
        $disconnect: vi.fn(),
        user: {
          findUnique: vi.fn(),
          findFirst: vi.fn(),
          update: vi.fn(),
        },
      })
      .overrideGuard(GoogleAuthGuard)
      .useValue(mockGuard)
      .compile();

    prismaAdapter = moduleFixture.get<PrismaAdapter>(PrismaAdapter);

    app = moduleFixture.createNestApplication({ logger: false });

    // Configure ValidationPipe with the same exceptionFactory as app.module.ts
    // Handle nested validation errors

    const flattenValidationErrors = (errors: any[]): any[] => {
      return errors.flatMap((error) => {
        const constraints = Object.values(error.constraints || {});
        const constraintErrors = constraints.map((message) => ({
          field: error.property,
          code: message as ValidationErrorCode,
        }));

        // Handle nested errors (children)
        const childrenErrors = error.children
          ? flattenValidationErrors(error.children).map((childError) => ({
              field: `${error.property}.${childError.field}`,
              code: childError.code,
            }))
          : [];

        return [...constraintErrors, ...childrenErrors];
      });
    };

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        exceptionFactory: (errors) => {
          const validationErrors = flattenValidationErrors(errors);
          return new UnprocessableEntityError(validationErrors);
        },
      }),
    );

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
    vi.clearAllMocks();
    loggerErrorSpy.mockRestore();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/user', () => {
    it('should return 200 with current user data', async () => {
      vi.mocked(prismaAdapter.user.findUnique).mockResolvedValueOnce(mockUser as any);

      const response = await fetch(`${baseUrl}/user`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe('test@example.com');
      expect(body.user.username).toBe('testuser');
      expect(body.user.bio).toBe('Test bio');
    });

    it('should return 404 when user does not exist', async () => {
      vi.mocked(prismaAdapter.user.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/user`);

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.USER_NOT_FOUND);
    });
  });

  describe('PUT /api/user', () => {
    it('should return 200 with updated user data when valid data is provided', async () => {
      const updatedUser = {
        ...mockUser,
        username: 'updateduser',
        bio: 'Updated bio',
      };

      vi.mocked(prismaAdapter.user.findUnique).mockResolvedValueOnce(mockUser as any);
      vi.mocked(prismaAdapter.user.findFirst).mockResolvedValueOnce(null); // username not taken

      vi.mocked(prismaAdapter.user.update).mockResolvedValueOnce(updatedUser as any);

      const response = await fetch(`${baseUrl}/user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            username: 'updateduser',
            bio: 'Updated bio',
          },
        }),
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.user).toBeDefined();
      expect(body.user.username).toBe('updateduser');
      expect(body.user.bio).toBe('Updated bio');
    });

    it('should return 200 when updating email', async () => {
      const updatedUser = {
        ...mockUser,
        email: 'newemail@example.com',
      };

      vi.mocked(prismaAdapter.user.findUnique).mockResolvedValueOnce(mockUser as any);
      vi.mocked(prismaAdapter.user.findFirst).mockResolvedValueOnce(null); // email not taken

      vi.mocked(prismaAdapter.user.update).mockResolvedValueOnce(updatedUser as any);

      const response = await fetch(`${baseUrl}/user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            email: 'newemail@example.com',
          },
        }),
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.user.email).toBe('newemail@example.com');
    });

    it('should return 422 when email is invalid', async () => {
      const response = await fetch(`${baseUrl}/user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            email: 'invalid-email',
          },
        }),
      });

      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.message).toBe('Validation Failed');
      expect(body.errors.length).toBeGreaterThan(0);
      expect(body.errors).toEqual(
        expect.arrayContaining([{ field: expect.stringMatching(/user\.email|email/), code: ERROR_CODE.EMAIL_INVALID }]),
      );
    });

    it('should return 422 when username is too short', async () => {
      const response = await fetch(`${baseUrl}/user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            username: 'ab',
          },
        }),
      });

      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.errors.length).toBeGreaterThan(0);
      expect(body.errors).toEqual(
        expect.arrayContaining([
          { field: expect.stringMatching(/user\.username|username/), code: ERROR_CODE.USERNAME_TOO_SHORT },
        ]),
      );
    });

    it('should return 404 when user does not exist', async () => {
      vi.mocked(prismaAdapter.user.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            username: 'updateduser',
          },
        }),
      });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.USER_NOT_FOUND);
    });
  });
});
