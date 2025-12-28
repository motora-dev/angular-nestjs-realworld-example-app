import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { API_URL } from '$shared/lib';
import { HomeApi } from './home.api';
import { ArticlesResponse, TagsResponse } from './home.response';

describe('HomeApi', () => {
  let api: HomeApi;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HomeApi, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: apiUrl }],
    });

    api = TestBed.inject(HomeApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getTags', () => {
    it('should return tags response', () => {
      const mockResponse: TagsResponse = {
        tags: ['tag1', 'tag2', 'tag3'],
      };

      api.getTags().subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/tags`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getArticles', () => {
    it('should return articles response for all type', () => {
      const mockResponse: ArticlesResponse = {
        articles: [
          {
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
        ],
        articlesCount: 1,
      };

      api.getArticles({ type: 'all', filters: {} }).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/articles`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return articles response for feed type', () => {
      const mockResponse: ArticlesResponse = {
        articles: [],
        articlesCount: 0,
      };

      api.getArticles({ type: 'feed', filters: {} }).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/articles/feed`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include query parameters in request', () => {
      const mockResponse: ArticlesResponse = {
        articles: [],
        articlesCount: 0,
      };

      api.getArticles({ type: 'all', filters: { tag: 'test', author: 'testuser' } }).subscribe();

      const req = httpMock.expectOne((request) => {
        return request.url === `${apiUrl}/articles` && request.params.has('tag') && request.params.has('author');
      });
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('tag')).toBe('test');
      expect(req.request.params.get('author')).toBe('testuser');
      req.flush(mockResponse);
    });

    it('should not include undefined filter values', () => {
      const mockResponse: ArticlesResponse = {
        articles: [],
        articlesCount: 0,
      };

      api.getArticles({ type: 'all', filters: { tag: 'test', author: undefined } }).subscribe();

      const req = httpMock.expectOne((request) => {
        return request.url === `${apiUrl}/articles` && request.params.has('tag') && !request.params.has('author');
      });
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('tag')).toBe('test');
      req.flush(mockResponse);
    });
  });
});
