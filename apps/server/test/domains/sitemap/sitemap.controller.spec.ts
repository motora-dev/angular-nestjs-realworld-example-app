import { ValidationErrorCode } from '@monorepo/error-code';
import { Logger, Module, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi, type MockInstance } from 'vitest';

import { PrismaAdapter } from '$adapters';
import { SitemapModule } from '$domains/sitemap/sitemap.module';
import { UnprocessableEntityError } from '$errors';
import { HttpExceptionFilter } from '$filters';

import type { INestApplication } from '@nestjs/common';

@Module({
  imports: [SitemapModule],
})
class TestModule {}

describe('Sitemap Controller E2E', () => {
  let app: INestApplication;
  let baseUrl: string;
  let prismaAdapter: PrismaAdapter;
  let loggerErrorSpy: MockInstance;

  const mockArticles = [
    {
      slug: 'article-1',
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    },
    {
      slug: 'article-2',
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
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
          findMany: vi.fn(),
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

  describe('GET /api/sitemap', () => {
    it('should return 200 with sitemap data', async () => {
      (prismaAdapter.article.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockArticles);

      const response = await fetch(`${baseUrl}/sitemap`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.articles).toBeDefined();
      expect(Array.isArray(body.articles)).toBe(true);
      expect(body.articles.length).toBe(2);
      expect(body.articles[0].slug).toBe('article-1');
      expect(body.articles[1].slug).toBe('article-2');
    });

    it('should return 200 with empty array when no articles exist', async () => {
      (prismaAdapter.article.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      const response = await fetch(`${baseUrl}/sitemap`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.articles).toBeDefined();
      expect(Array.isArray(body.articles)).toBe(true);
      expect(body.articles.length).toBe(0);
    });
  });
});
