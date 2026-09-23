import { ValidationErrorCode } from '@monorepo/error-code';
import { CanActivate, ExecutionContext, Logger, Module, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi, type MockInstance } from 'vitest';

import { PrismaAdapter } from '$adapters';
import type { CurrentUserType } from '$decorators';
import { ArticleListModule } from '$domains/article-list/article-list.module';
import { ArticleWithRelations } from '$domains/article-list/contracts';
import { UnprocessableEntityError } from '$errors';
import { HttpExceptionFilter } from '$filters';
import { GoogleAuthGuard } from '$modules/auth/guards';

import type { INestApplication } from '@nestjs/common';

@Module({
  imports: [ArticleListModule],
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

describe('Article List Controller E2E', () => {
  let app: INestApplication;
  let baseUrl: string;
  let prismaAdapter: PrismaAdapter;
  let loggerErrorSpy: MockInstance;

  const mockCurrentUser: CurrentUserType = {
    id: 1,
    publicId: 'test-public-id',
    username: 'testuser',
  };

  const mockArticle = {
    id: 1,
    slug: 'test-article-slug',
    title: 'Test Article',
    description: 'Test Description',
    body: 'Test Body',
    tags: ['tag1', 'tag2'],
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    userId: 1,
    user: {
      id: 1,
      username: 'testuser',
      bio: null,
      image: null,
    },
    favorites: [],
    _count: {
      favorites: 0,
    },
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
        article: {
          findMany: vi.fn(),
          count: vi.fn(),
        },
        follow: {
          findUnique: vi.fn(),
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

  describe('GET /api/articles', () => {
    it('should return 200 with articles list', async () => {
      vi.mocked(prismaAdapter.article.findMany).mockResolvedValueOnce([mockArticle]);
      vi.mocked(prismaAdapter.article.count).mockResolvedValueOnce(1);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.articles).toBeDefined();
      expect(Array.isArray(body.articles)).toBe(true);
      expect(body.articlesCount).toBe(1);
    });

    it('should return 200 with filtered articles by tag', async () => {
      vi.mocked(prismaAdapter.article.findMany).mockResolvedValueOnce([mockArticle]);
      vi.mocked(prismaAdapter.article.count).mockResolvedValueOnce(1);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles?tag=tag1`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.articles).toBeDefined();
      expect(Array.isArray(body.articles)).toBe(true);
    });

    it('should return 200 with filtered articles by author', async () => {
      vi.mocked(prismaAdapter.article.findMany).mockResolvedValueOnce([mockArticle]);
      vi.mocked(prismaAdapter.article.count).mockResolvedValueOnce(1);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles?author=testuser`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.articles).toBeDefined();
      expect(Array.isArray(body.articles)).toBe(true);
    });

    it('should return 200 with filtered articles by favorited', async () => {
      vi.mocked(prismaAdapter.article.findMany).mockResolvedValueOnce([mockArticle]);
      vi.mocked(prismaAdapter.article.count).mockResolvedValueOnce(1);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles?favorited=testuser`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.articles).toBeDefined();
      expect(Array.isArray(body.articles)).toBe(true);
    });

    it('should return 200 with paginated articles', async () => {
      vi.mocked(prismaAdapter.article.findMany).mockResolvedValueOnce([mockArticle]);
      vi.mocked(prismaAdapter.article.count).mockResolvedValueOnce(1);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles?offset=0&limit=10`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.articles).toBeDefined();
      expect(Array.isArray(body.articles)).toBe(true);
    });

    it('should return 200 with empty array when no articles found', async () => {
      vi.mocked(prismaAdapter.article.findMany).mockResolvedValueOnce([]);
      vi.mocked(prismaAdapter.article.count).mockResolvedValueOnce(0);

      const response = await fetch(`${baseUrl}/articles`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.articles).toBeDefined();
      expect(Array.isArray(body.articles)).toBe(true);
      expect(body.articles.length).toBe(0);
      expect(body.articlesCount).toBe(0);
    });
  });

  describe('GET /api/articles/feed', () => {
    it('should return 200 with feed articles when authenticated', async () => {
      vi.mocked(prismaAdapter.article.findMany).mockResolvedValueOnce([mockArticle]);
      vi.mocked(prismaAdapter.article.count).mockResolvedValueOnce(1);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles/feed`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.articles).toBeDefined();
      expect(Array.isArray(body.articles)).toBe(true);
      expect(body.articlesCount).toBe(1);
    });

    it('should return 200 with paginated feed articles', async () => {
      vi.mocked(prismaAdapter.article.findMany).mockResolvedValueOnce([mockArticle]);
      vi.mocked(prismaAdapter.article.count).mockResolvedValueOnce(1);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles/feed?offset=0&limit=10`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.articles).toBeDefined();
      expect(Array.isArray(body.articles)).toBe(true);
    });

    it('should return 200 with empty array when no feed articles found', async () => {
      vi.mocked(prismaAdapter.article.findMany).mockResolvedValueOnce([]);
      vi.mocked(prismaAdapter.article.count).mockResolvedValueOnce(0);

      const response = await fetch(`${baseUrl}/articles/feed`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.articles).toBeDefined();
      expect(Array.isArray(body.articles)).toBe(true);
      expect(body.articles.length).toBe(0);
      expect(body.articlesCount).toBe(0);
    });
  });

  describe('GET /api/tags', () => {
    it('should return 200 with tags list', async () => {
      const articlesWithTags = [{ tags: ['tag1', 'tag2'] }, { tags: ['tag2', 'tag3'] }];
      vi.mocked(prismaAdapter.article.findMany).mockResolvedValueOnce(articlesWithTags as ArticleWithRelations[]);

      const response = await fetch(`${baseUrl}/tags`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.tags).toBeDefined();
      expect(Array.isArray(body.tags)).toBe(true);
      expect(body.tags.length).toBeGreaterThan(0);
    });

    it('should return 200 with empty array when no tags found', async () => {
      vi.mocked(prismaAdapter.article.findMany).mockResolvedValueOnce([]);

      const response = await fetch(`${baseUrl}/tags`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.tags).toBeDefined();
      expect(Array.isArray(body.tags)).toBe(true);
      expect(body.tags.length).toBe(0);
    });
  });
});
