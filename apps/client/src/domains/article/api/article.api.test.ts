import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { API_URL } from '$shared/lib';
import { Article } from '../model';
import { ArticleApi } from './article.api';
import { SingleArticleResponse } from './article.response';

describe('ArticleApi', () => {
  let api: ArticleApi;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ArticleApi, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: apiUrl }],
    });

    api = TestBed.inject(ArticleApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('get', () => {
    it('should return article response', () => {
      const slug = 'test-slug';
      const mockResponse: SingleArticleResponse = {
        article: {
          slug: 'test-slug',
          title: 'Test Article',
          description: 'Test Description',
          body: 'Test Body',
          tagList: ['test', 'article'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          favorited: false,
          favoritesCount: 0,
          author: {
            username: 'testuser',
            bio: 'Test Bio',
            image: 'https://example.com/image.jpg',
            following: false,
          },
        },
      };

      api.get(slug).subscribe((response) => {
        expect(response).toEqual(mockResponse.article);
      });

      const req = httpMock.expectOne(`${apiUrl}/articles/${slug}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('create', () => {
    it('should create article and return article response', () => {
      const articleData: Partial<Article> = {
        title: 'New Article',
        description: 'New Description',
        body: 'New Body',
        tagList: ['new'],
      };

      const mockResponse: SingleArticleResponse = {
        article: {
          slug: 'new-article',
          title: 'New Article',
          description: 'New Description',
          body: 'New Body',
          tagList: ['new'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          favorited: false,
          favoritesCount: 0,
          author: {
            username: 'testuser',
            bio: '',
            image: '',
            following: false,
          },
        },
      };

      api.create(articleData).subscribe((response) => {
        expect(response).toEqual(mockResponse.article);
      });

      const req = httpMock.expectOne(`${apiUrl}/articles`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ article: articleData });
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update article and return article response', () => {
      const articleData: Partial<Article> = {
        slug: 'test-slug',
        title: 'Updated Article',
        description: 'Updated Description',
        body: 'Updated Body',
        tagList: ['updated'],
      };

      const mockResponse: SingleArticleResponse = {
        article: {
          slug: 'test-slug',
          title: 'Updated Article',
          description: 'Updated Description',
          body: 'Updated Body',
          tagList: ['updated'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
          favorited: false,
          favoritesCount: 0,
          author: {
            username: 'testuser',
            bio: '',
            image: '',
            following: false,
          },
        },
      };

      api.update(articleData).subscribe((response) => {
        expect(response).toEqual(mockResponse.article);
      });

      const req = httpMock.expectOne(`${apiUrl}/articles/${articleData.slug}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ article: articleData });
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete article', () => {
      const slug = 'test-slug';

      api.delete(slug).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/articles/${slug}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('favorite', () => {
    it('should favorite article and return article response', () => {
      const slug = 'test-slug';

      const mockResponse: SingleArticleResponse = {
        article: {
          slug: 'test-slug',
          title: 'Test Article',
          description: 'Test Description',
          body: 'Test Body',
          tagList: [],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          favorited: true,
          favoritesCount: 1,
          author: {
            username: 'testuser',
            bio: '',
            image: '',
            following: false,
          },
        },
      };

      api.favorite(slug).subscribe((response) => {
        expect(response).toEqual(mockResponse.article);
        expect(response.favorited).toBe(true);
        expect(response.favoritesCount).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/articles/${slug}/favorite`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });
  });

  describe('unfavorite', () => {
    it('should unfavorite article', () => {
      const slug = 'test-slug';

      api.unfavorite(slug).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/articles/${slug}/favorite`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
