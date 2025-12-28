import { ERROR_CODE, ValidationErrorCode } from '@monorepo/error-code';
import { CanActivate, ExecutionContext, Logger, Module, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi, type MockInstance } from 'vitest';

import type { INestApplication } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';
import type { CurrentUserType } from '$decorators';
import { UnprocessableEntityError } from '$errors';
import { HttpExceptionFilter } from '$filters';
import { GoogleAuthGuard } from '$modules/auth/guards';
import { ProfileModule } from '$domains/profile/profile.module';

@Module({
  imports: [ProfileModule],
})
class TestModule {}

// Custom guard to set authenticated user in request
class MockAuthGuard implements CanActivate {
  constructor(private readonly user?: CurrentUserType) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (this.user) {
      request.user = this.user;
    }
    return true;
  }
}

describe('Profile Controller E2E', () => {
  let app: INestApplication;
  let baseUrl: string;
  let prismaAdapter: PrismaAdapter;
  let loggerErrorSpy: MockInstance;

  const mockCurrentUser: CurrentUserType = {
    id: 1,
    publicId: 'test-public-id',
    username: 'testuser',
  };

  const mockProfileUser = {
    id: 2,
    username: 'profileuser',
    bio: 'Profile bio',
    image: 'https://example.com/image.jpg',
  };

  beforeAll(async () => {
    // For profile endpoints, auth is optional, so we can use a guard that allows optional user
    const mockGuard = new MockAuthGuard();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    })
      .overrideProvider(PrismaAdapter)
      .useValue({
        $connect: vi.fn(),
        $disconnect: vi.fn(),
        user: {
          findUnique: vi.fn(),
        },
        follow: {
          findUnique: vi.fn(),
          upsert: vi.fn(),
          deleteMany: vi.fn(),
        },
      })
      .overrideGuard(GoogleAuthGuard)
      .useValue(mockGuard)
      .compile();

    prismaAdapter = moduleFixture.get<PrismaAdapter>(PrismaAdapter);

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

  describe('GET /api/profiles/:username', () => {
    it('should return 200 with profile data when user exists', async () => {
      vi.mocked(prismaAdapter.user.findUnique).mockResolvedValueOnce(mockProfileUser as any);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/profiles/profileuser`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.profile).toBeDefined();
      expect(body.profile.username).toBe('profileuser');
      expect(body.profile.bio).toBe('Profile bio');
      expect(body.profile.following).toBe(false);
    });

    it('should return 200 with following=true when authenticated user is following', async () => {
      vi.mocked(prismaAdapter.user.findUnique).mockResolvedValueOnce(mockProfileUser as any);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce({
        followerId: 1,
        followingId: 2,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      });

      // Set authenticated user in request
      const mockGuard = new MockAuthGuard(mockCurrentUser);
      app.useGlobalGuards(mockGuard);

      const response = await fetch(`${baseUrl}/profiles/profileuser`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.profile.following).toBe(true);
    });

    it('should return 404 when user does not exist', async () => {
      vi.mocked(prismaAdapter.user.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/profiles/non-existent-user`);

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.USER_NOT_FOUND);
    });
  });

  describe('POST /api/profiles/:username/follow', () => {
    it('should return 200 with profile when follow is successful', async () => {
      const mockGuard = new MockAuthGuard(mockCurrentUser);
      app.useGlobalGuards(mockGuard);

      vi.mocked(prismaAdapter.user.findUnique).mockResolvedValueOnce(mockProfileUser as any);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prismaAdapter.follow.upsert).mockResolvedValueOnce({
        followerId: 1,
        followingId: 2,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      } as any);

      const response = await fetch(`${baseUrl}/profiles/profileuser/follow`, {
        method: 'POST',
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.profile).toBeDefined();
      expect(body.profile.username).toBe('profileuser');
      expect(body.profile.following).toBe(true);
    });

    it('should return 404 when user does not exist', async () => {
      const mockGuard = new MockAuthGuard(mockCurrentUser);
      app.useGlobalGuards(mockGuard);

      vi.mocked(prismaAdapter.user.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/profiles/non-existent-user/follow`, {
        method: 'POST',
      });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.USER_NOT_FOUND);
    });
  });

  describe('DELETE /api/profiles/:username/follow', () => {
    it('should return 200 with profile when unfollow is successful', async () => {
      const mockGuard = new MockAuthGuard(mockCurrentUser);
      app.useGlobalGuards(mockGuard);

      vi.mocked(prismaAdapter.user.findUnique).mockResolvedValueOnce(mockProfileUser as any);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce({
        followerId: 1,
        followingId: 2,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      });
      vi.mocked(prismaAdapter.follow.deleteMany).mockResolvedValueOnce({ count: 1 } as any);

      const response = await fetch(`${baseUrl}/profiles/profileuser/follow`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.profile).toBeDefined();
      expect(body.profile.username).toBe('profileuser');
      expect(body.profile.following).toBe(false);
    });

    it('should return 404 when user does not exist', async () => {
      const mockGuard = new MockAuthGuard(mockCurrentUser);
      app.useGlobalGuards(mockGuard);

      vi.mocked(prismaAdapter.user.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/profiles/non-existent-user/follow`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.USER_NOT_FOUND);
    });
  });
});

