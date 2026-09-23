import { ERROR_CODE, ValidationErrorCode } from '@monorepo/error-code';
import { CanActivate, ExecutionContext, Logger, Module, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi, type MockInstance } from 'vitest';

import { PrismaAdapter } from '$adapters';
import type { CurrentUserType } from '$decorators';
import { ArticleEditModule } from '$domains/article-edit/article-edit.module';
import { UnprocessableEntityError } from '$errors';
import { HttpExceptionFilter } from '$filters';
import { GoogleAuthGuard } from '$modules/auth/guards';

import type { INestApplication } from '@nestjs/common';

@Module({
  imports: [ArticleEditModule],
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

describe('Article Edit Controller E2E', () => {
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

  const mockComment = {
    id: 1,
    body: 'Test comment',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    articleId: 1,
    userId: 1,
    publicId: 'test-comment-public-id',
    user: {
      id: 1,
      username: 'testuser',
      bio: null,
      image: null,
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
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
        comment: {
          create: vi.fn(),
          deleteMany: vi.fn(),
          findUnique: vi.fn(),
        },
        favorite: {
          upsert: vi.fn(),
          deleteMany: vi.fn(),
          findUnique: vi.fn(),
        },
        follow: {
          findUnique: vi.fn(),
        },
        tag: {
          createMany: vi.fn(),
          deleteMany: vi.fn(),
        },
        articleTag: {
          createMany: vi.fn(),
          deleteMany: vi.fn(),
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

  describe('POST /api/articles', () => {
    it('should return 201 with created article when valid data is provided', async () => {
      const createdArticle = {
        ...mockArticle,
        slug: 'new-article-slug',
        title: 'New Article',
        description: 'New Description',
        body: 'New Body',
        tags: ['tag1'],
      };

      vi.mocked(prismaAdapter.article.create).mockResolvedValueOnce(createdArticle as any);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: {
            title: 'New Article',
            description: 'New Description',
            body: 'New Body',
            tagList: ['tag1'],
          },
        }),
      });

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.article).toBeDefined();
      expect(body.article.title).toBe('New Article');
    });

    it('should return 422 when title is missing', async () => {
      const response = await fetch(`${baseUrl}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: {
            description: 'Description',
            body: 'Body',
          },
        }),
      });

      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.message).toBe('Validation Failed');
      // Nested validation errors have field names like 'article.title'
      expect(body.errors.length).toBeGreaterThan(0);
      expect(body.errors).toEqual(
        expect.arrayContaining([
          { field: expect.stringMatching(/article\.title|title/), code: ERROR_CODE.TITLE_REQUIRED },
        ]),
      );
    });

    it('should return 422 when description is missing', async () => {
      const response = await fetch(`${baseUrl}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: {
            title: 'Title',
            body: 'Body',
          },
        }),
      });

      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.errors.length).toBeGreaterThan(0);
      expect(body.errors).toEqual(
        expect.arrayContaining([
          { field: expect.stringMatching(/article\.description|description/), code: ERROR_CODE.DESCRIPTION_REQUIRED },
        ]),
      );
    });

    it('should return 422 when body is missing', async () => {
      const response = await fetch(`${baseUrl}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: {
            title: 'Title',
            description: 'Description',
          },
        }),
      });

      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.errors.length).toBeGreaterThan(0);
      expect(body.errors).toEqual(
        expect.arrayContaining([
          { field: expect.stringMatching(/article\.body|body/), code: ERROR_CODE.BODY_REQUIRED },
        ]),
      );
    });
  });

  describe('GET /api/articles/:slug/edit', () => {
    it('should return 200 with article when user is the author', async () => {
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(mockArticle);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles/test-article-slug/edit`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.article).toBeDefined();
      expect(body.article.slug).toBe('test-article-slug');
    });

    it('should return 403 when user is not the author', async () => {
      const otherUserArticle = { ...mockArticle, userId: 2 };
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(otherUserArticle);

      const response = await fetch(`${baseUrl}/articles/test-article-slug/edit`);

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.FORBIDDEN);
    });

    it('should return 404 when article does not exist', async () => {
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles/non-existent-slug/edit`);

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.ARTICLE_NOT_FOUND);
    });
  });

  describe('PUT /api/articles/:slug', () => {
    it('should return 200 with updated article when user is the author', async () => {
      const updatedArticle = { ...mockArticle, title: 'Updated Title' };
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(mockArticle);

      vi.mocked(prismaAdapter.article.update).mockResolvedValueOnce(updatedArticle as any);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles/test-article-slug`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: {
            title: 'Updated Title',
          },
        }),
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.article).toBeDefined();
      expect(body.article.title).toBe('Updated Title');
    });

    it('should return 403 when user is not the author', async () => {
      const otherUserArticle = { ...mockArticle, userId: 2 };
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(otherUserArticle);

      const response = await fetch(`${baseUrl}/articles/test-article-slug`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: {
            title: 'Updated Title',
          },
        }),
      });

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.FORBIDDEN);
    });

    it('should return 404 when article does not exist', async () => {
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles/non-existent-slug`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: {
            title: 'Updated Title',
          },
        }),
      });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.ARTICLE_NOT_FOUND);
    });
  });

  describe('DELETE /api/articles/:slug', () => {
    it('should return 204 when article is deleted successfully', async () => {
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(mockArticle);

      vi.mocked(prismaAdapter.article.delete).mockResolvedValueOnce(mockArticle as any);

      const response = await fetch(`${baseUrl}/articles/test-article-slug`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(204);
    });

    it('should return 403 when user is not the author', async () => {
      const otherUserArticle = { ...mockArticle, userId: 2 };
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(otherUserArticle);

      const response = await fetch(`${baseUrl}/articles/test-article-slug`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.FORBIDDEN);
    });

    it('should return 404 when article does not exist', async () => {
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles/non-existent-slug`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.ARTICLE_NOT_FOUND);
    });
  });

  describe('POST /api/articles/:slug/favorite', () => {
    it('should return 200 with favorited article', async () => {
      const favoritedArticle = {
        ...mockArticle,
        favorites: [{ userId: 1 }],
        _count: { favorites: 1 },
      };
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(mockArticle);
      vi.mocked(prismaAdapter.favorite.findUnique).mockResolvedValueOnce(null);

      vi.mocked(prismaAdapter.favorite.upsert).mockResolvedValueOnce({ userId: 1, articleId: 1 } as any);
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(favoritedArticle);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles/test-article-slug/favorite`, {
        method: 'POST',
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.article).toBeDefined();
      expect(body.article.favorited).toBe(true);
    });

    it('should return 404 when article does not exist', async () => {
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles/non-existent-slug/favorite`, {
        method: 'POST',
      });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.ARTICLE_NOT_FOUND);
    });
  });

  describe('DELETE /api/articles/:slug/favorite', () => {
    it('should return 200 with unfavorited article', async () => {
      const favoritedArticle = {
        ...mockArticle,
        favorites: [{ userId: 1 }],
        _count: { favorites: 1 },
      };
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(favoritedArticle);

      vi.mocked(prismaAdapter.favorite.findUnique).mockResolvedValueOnce({ userId: 1, articleId: 1 } as any);

      vi.mocked(prismaAdapter.favorite.deleteMany).mockResolvedValueOnce({ count: 1 } as any);
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(mockArticle);
      vi.mocked(prismaAdapter.follow.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles/test-article-slug/favorite`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.article).toBeDefined();
      expect(body.article.favorited).toBe(false);
    });

    it('should return 404 when article does not exist', async () => {
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles/non-existent-slug/favorite`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.ARTICLE_NOT_FOUND);
    });
  });

  describe('POST /api/articles/:slug/comments', () => {
    it('should return 200 with created comment when valid data is provided', async () => {
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce({ id: 1, slug: 'test-article-slug' } as any);

      vi.mocked(prismaAdapter.comment.create).mockResolvedValueOnce(mockComment as any);

      const response = await fetch(`${baseUrl}/articles/test-article-slug/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: {
            body: 'Test comment',
          },
        }),
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.comment).toBeDefined();
      expect(body.comment.body).toBe('Test comment');
    });

    it('should return 422 when body is missing', async () => {
      const response = await fetch(`${baseUrl}/articles/test-article-slug/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: {},
        }),
      });

      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.errors.length).toBeGreaterThan(0);
      expect(body.errors).toEqual(
        expect.arrayContaining([
          { field: expect.stringMatching(/comment\.body|body/), code: ERROR_CODE.COMMENT_BODY_REQUIRED },
        ]),
      );
    });

    it('should return 404 when article does not exist', async () => {
      vi.mocked(prismaAdapter.article.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles/non-existent-slug/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: {
            body: 'Test comment',
          },
        }),
      });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.ARTICLE_NOT_FOUND);
    });
  });

  describe('DELETE /api/articles/:slug/comments/:id', () => {
    it('should return 204 when comment is deleted successfully', async () => {
      vi.mocked(prismaAdapter.comment.findUnique).mockResolvedValueOnce(mockComment as any);

      vi.mocked(prismaAdapter.comment.deleteMany).mockResolvedValueOnce({ count: 1 } as any);

      const response = await fetch(`${baseUrl}/articles/test-article-slug/comments/1`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(204);
    });

    it('should return 403 when user is not the comment author', async () => {
      const otherUserComment = { ...mockComment, userId: 2, user: { ...mockComment.user, id: 2 } };

      vi.mocked(prismaAdapter.comment.findUnique).mockResolvedValueOnce(otherUserComment as any);

      const response = await fetch(`${baseUrl}/articles/test-article-slug/comments/1`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.FORBIDDEN);
    });

    it('should return 404 when comment does not exist', async () => {
      vi.mocked(prismaAdapter.comment.findUnique).mockResolvedValueOnce(null);

      const response = await fetch(`${baseUrl}/articles/test-article-slug/comments/999`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.errorCode).toBe(ERROR_CODE.COMMENT_NOT_FOUND);
    });
  });
});
