import { PrismaAdapter } from '$adapters';
import { ProfileModule } from '$domains/profile/profile.module';
import { UnprocessableEntityError } from '$errors';
import { HttpExceptionFilter } from '$filters';
import { GoogleAuthGuard } from '$modules/auth/guards';
import { ERROR_CODE, ValidationErrorCode } from '@monorepo/error-code';
import { ExecutionContext, Logger, Module, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi, type MockInstance } from 'vitest';

import type { CurrentUserType } from '$decorators';
import type { INestApplication } from '@nestjs/common';

@Module({
  imports: [ProfileModule],
})
class TestModule {}

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
    // For profile endpoints, use a guard that sets user when needed
    // GET endpoint doesn't require auth, but follow/unfollow do
    // Note: GET endpoint uses @CurrentUser() which reads from request.user if available
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
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          // Always set user for testing
          request.user = mockCurrentUser;
          return true;
        },
      })
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

    // Middleware to set user for all requests (for testing purposes)
    // This simulates authenticated requests even when @UseGuards is not applied
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.use((req: any, res: any, next: any) => {
      req.user = mockCurrentUser;
      next();
    });

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(prismaAdapter.user.findUnique).mockResolvedValueOnce(mockProfileUser as any);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce({
        followerId: 1,
        followingId: 2,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      });

      // The guard sets request.user, so CurrentUser decorator will return the user
      const response = await fetch(`${baseUrl}/profiles/profileuser`);

      expect(response.status).toBe(200);
      const body = await response.json();
      // Note: The guard sets user, so following should be checked
      // However, GET endpoint doesn't use @UseGuards, so guard might not run
      // Let's check if following is true when guard sets the user
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(prismaAdapter.user.findUnique).mockResolvedValueOnce(mockProfileUser as any);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prismaAdapter.follow.upsert).mockResolvedValueOnce({
        followerId: 1,
        followingId: 2,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(prismaAdapter.user.findUnique).mockResolvedValueOnce(mockProfileUser as any);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce({
        followerId: 1,
        followingId: 2,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
