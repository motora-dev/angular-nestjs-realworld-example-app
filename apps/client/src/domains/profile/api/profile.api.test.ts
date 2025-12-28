import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { API_URL } from '$shared/lib';
import { ProfileApi } from './profile.api';
import { ProfileResponse } from './profile.response';

describe('ProfileApi', () => {
  let api: ProfileApi;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProfileApi, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: apiUrl }],
    });

    api = TestBed.inject(ProfileApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('get', () => {
    it('should return profile', () => {
      const username = 'testuser';
      const mockResponse: ProfileResponse = {
        profile: {
          username: 'testuser',
          bio: 'Test Bio',
          image: 'https://example.com/image.jpg',
          following: false,
        },
      };

      api.get(username).subscribe((profile) => {
        expect(profile).toEqual(mockResponse.profile);
      });

      const req = httpMock.expectOne(`${apiUrl}/profiles/${username}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('follow', () => {
    it('should follow user and return updated profile', () => {
      const username = 'testuser';
      const mockResponse: ProfileResponse = {
        profile: {
          username: 'testuser',
          bio: 'Test Bio',
          image: 'https://example.com/image.jpg',
          following: true,
        },
      };

      api.follow(username).subscribe((profile) => {
        expect(profile).toEqual(mockResponse.profile);
        expect(profile.following).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/profiles/${username}/follow`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('unfollow', () => {
    it('should unfollow user and return updated profile', () => {
      const username = 'testuser';
      const mockResponse: ProfileResponse = {
        profile: {
          username: 'testuser',
          bio: 'Test Bio',
          image: 'https://example.com/image.jpg',
          following: false,
        },
      };

      api.unfollow(username).subscribe((profile) => {
        expect(profile).toEqual(mockResponse.profile);
        expect(profile.following).toBe(false);
      });

      const req = httpMock.expectOne(`${apiUrl}/profiles/${username}/follow`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });
});
