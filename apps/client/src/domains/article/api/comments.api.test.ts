import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { API_URL } from '$shared/lib';
import { CommentsApi } from './comments.api';
import { CommentsResponse, SingleCommentResponse } from './comments.response';

describe('CommentsApi', () => {
  let api: CommentsApi;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommentsApi, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: apiUrl }],
    });

    api = TestBed.inject(CommentsApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll', () => {
    it('should return array of comment responses', () => {
      const slug = 'test-slug';
      const mockResponse: CommentsResponse = {
        comments: [
          {
            id: '1',
            body: 'Test Comment 1',
            createdAt: '2024-01-01T00:00:00.000Z',
            author: {
              username: 'user1',
              bio: 'Bio 1',
              image: 'https://example.com/image1.jpg',
              following: false,
            },
          },
          {
            id: '2',
            body: 'Test Comment 2',
            createdAt: '2024-01-02T00:00:00.000Z',
            author: {
              username: 'user2',
              bio: 'Bio 2',
              image: 'https://example.com/image2.jpg',
              following: false,
            },
          },
        ],
      };

      api.getAll(slug).subscribe((response) => {
        expect(response).toEqual(mockResponse.comments);
        expect(response).toHaveLength(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/articles/${slug}/comments`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return empty array when no comments exist', () => {
      const slug = 'test-slug';
      const mockResponse: CommentsResponse = {
        comments: [],
      };

      api.getAll(slug).subscribe((response) => {
        expect(response).toEqual([]);
        expect(response).toHaveLength(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/articles/${slug}/comments`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('add', () => {
    it('should add comment and return comment response', () => {
      const slug = 'test-slug';
      const body = 'New Comment';

      const mockResponse: SingleCommentResponse = {
        comment: {
          id: '3',
          body: 'New Comment',
          createdAt: '2024-01-03T00:00:00.000Z',
          author: {
            username: 'testuser',
            bio: 'Test Bio',
            image: 'https://example.com/image.jpg',
            following: false,
          },
        },
      };

      api.add(slug, body).subscribe((response) => {
        expect(response).toEqual(mockResponse.comment);
        expect(response.body).toBe(body);
      });

      const req = httpMock.expectOne(`${apiUrl}/articles/${slug}/comments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ comment: { body } });
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete comment', () => {
      const commentId = '1';
      const slug = 'test-slug';

      api.delete(commentId, slug).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/articles/${slug}/comments/${commentId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
