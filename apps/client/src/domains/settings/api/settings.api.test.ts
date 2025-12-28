import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { API_URL } from '$shared/lib';
import { SettingsFormModel } from '../model';
import { SettingsApi } from './settings.api';
import { UserResponse } from './settings.response';

describe('SettingsApi', () => {
  let api: SettingsApi;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SettingsApi, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: apiUrl }],
    });

    api = TestBed.inject(SettingsApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getCurrentUser', () => {
    it('should return current user with mapped fields', () => {
      const mockResponse: UserResponse = {
        user: {
          username: 'testuser',
          email: 'test@example.com',
          bio: 'Test Bio',
          image: 'https://example.com/image.jpg',
        },
      };

      api.getCurrentUser().subscribe((user) => {
        expect(user).toEqual({
          username: 'testuser',
          email: 'test@example.com',
          bio: 'Test Bio',
          image: 'https://example.com/image.jpg',
        });
      });

      const req = httpMock.expectOne(`${apiUrl}/user`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should map null bio and image to empty strings', () => {
      const mockResponse: UserResponse = {
        user: {
          username: 'testuser',
          email: 'test@example.com',
          bio: null as any,
          image: null as any,
        },
      };

      api.getCurrentUser().subscribe((user) => {
        expect(user.bio).toBe('');
        expect(user.image).toBe('');
      });

      const req = httpMock.expectOne(`${apiUrl}/user`);
      req.flush(mockResponse);
    });
  });

  describe('updateUser', () => {
    it('should update user and return updated user with mapped fields', () => {
      const userData = {
        bio: 'Updated Bio',
      };
      const mockResponse: UserResponse = {
        user: {
          username: 'testuser',
          email: 'test@example.com',
          bio: 'Updated Bio',
          image: 'https://example.com/image.jpg',
        },
      };

      api.updateUser(userData).subscribe((user) => {
        expect(user).toEqual({
          username: 'testuser',
          email: 'test@example.com',
          bio: 'Updated Bio',
          image: 'https://example.com/image.jpg',
        });
      });

      const req = httpMock.expectOne(`${apiUrl}/user`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ user: userData });
      req.flush(mockResponse);
    });

    it('should map null bio and image to empty strings', () => {
      const userData: Partial<SettingsFormModel> = {
        bio: undefined,
        image: undefined,
      };
      const mockResponse: UserResponse = {
        user: {
          username: 'testuser',
          email: 'test@example.com',
          bio: null as any,
          image: null as any,
        },
      };

      api.updateUser(userData).subscribe((user) => {
        expect(user.bio).toBe('');
        expect(user.image).toBe('');
      });

      const req = httpMock.expectOne(`${apiUrl}/user`);
      req.flush(mockResponse);
    });
  });
});
