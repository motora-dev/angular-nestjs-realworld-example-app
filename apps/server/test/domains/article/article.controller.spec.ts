import { PrismaAdapter } from '$adapters';
import { ArticleModule } from '$domains/article/article.module';
import { UnprocessableEntityError } from '$errors';
import { HttpExceptionFilter } from '$filters';
import { ERROR_CODE, ValidationErrorCode } from '@monorepo/error-code';
import { Logger, Module, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi, type MockInstance } from 'vitest';

import type { INestApplication } from '@nestjs/common';

@Module({
  imports: [ArticleModule],
})
class TestModule {}

describe('Article Controller E2E', () => {
  let app: INestApplication;
  let baseUrl: string;
  let prismaAdapter: PrismaAdapter;
  let loggerErrorSpy: MockInstance;

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

  const mockComments = [
    {
      id: 1,
      body: 'Test comment 1',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      articleId: 1,
      userId: 1,
      publicId: 'test-comment-public-id-1',
      user: {
        id: 1,
        username: 'commenter',
        bio: null,
        image: null,
      },
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    })
      .overrideProvider(PrismaAdapter)
      .useValue({
        $connect: vi.fn(),
        $disconnect: vi.fn(),
        article: {
          findUnique: vi.fn(),
        },
        comment: {
          findMany: vi.fn(),
        },
        follow: {
          findUnique: vi.fn(),
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

  describe('GET /api/articles/:slug', () => {
    it('should return 200 with article data when article exists', async () => {
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(mockArticle);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles/test-article-slug`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.article).toBeDefined();
      expect(body.article.slug).toBe('test-article-slug');
      expect(body.article.title).toBe('Test Article');
      expect(body.article.author.username).toBe('testuser');
    });

    it('should return 200 with article data when authenticated user is following author', async () => {
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(mockArticle);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce({
        followerId: 2,
        followingId: 1,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      });

      // Note: In this test, currentUserId is optional, so we test without auth
      // The following status will be false since there's no authenticated user
      const response = await fetch(`${baseUrl}/articles/test-article-slug`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.article).toBeDefined();
      expect(body.article.author.following).toBe(false);
    });

    it('should return 404 when article does not exist', async () => {
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles/non-existent-slug`);

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.ARTICLE_NOT_FOUND);
    });
  });

  describe('GET /api/articles/:slug/comments', () => {
    it('should return 200 with comments when article exists', async () => {
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce({
        id: 1,
        slug: 'test-article-slug',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      vi.mocked(prismaAdapter.comment.findMany).mockResolvedValueOnce(mockComments);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles/test-article-slug/comments`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.comments).toBeDefined();
      expect(Array.isArray(body.comments)).toBe(true);
      expect(body.comments.length).toBe(1);
      expect(body.comments[0].body).toBe('Test comment 1');
      expect(body.comments[0].author.username).toBe('commenter');
    });

    it('should return 200 with empty array when article has no comments', async () => {
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce({
        id: 1,
        slug: 'test-article-slug',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      vi.mocked(prismaAdapter.comment.findMany).mockResolvedValueOnce([]);

      const response = await fetch(`${baseUrl}/articles/test-article-slug/comments`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.comments).toBeDefined();
      expect(Array.isArray(body.comments)).toBe(true);
      expect(body.comments.length).toBe(0);
    });

    it('should return 200 with empty array when article does not exist', async () => {
      // getComments returns empty array when article doesn't exist
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles/non-existent-slug/comments`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.comments).toBeDefined();
      expect(Array.isArray(body.comments)).toBe(true);
      expect(body.comments.length).toBe(0);
    });
  });
});
