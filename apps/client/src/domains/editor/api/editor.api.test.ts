import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { API_URL } from '$shared/lib';
import { EditorArticle } from '../model';
import { EditorApi } from './editor.api';
import { SingleArticleResponse } from './editor.response';

describe('EditorApi', () => {
  let api: EditorApi;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EditorApi, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: apiUrl }],
    });

    api = TestBed.inject(EditorApi);
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
          tagList: ['test'],
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
      const articleData: Partial<EditorArticle> = {
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
      const articleData: Partial<EditorArticle> = {
        slug: 'test-slug',
        title: 'Updated Article',
        description: 'Updated Description',
        body: 'Updated Body',
      };

      const mockResponse: SingleArticleResponse = {
        article: {
          slug: 'test-slug',
          title: 'Updated Article',
          description: 'Updated Description',
          body: 'Updated Body',
          tagList: ['test'],
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
});
