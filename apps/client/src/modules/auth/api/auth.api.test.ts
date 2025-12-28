import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { API_URL } from '$shared/lib';
import { User } from '../model';
import { AuthApi } from './auth.api';
import { CheckSessionResponse, LogoutResponse, UserResponse } from './auth.response';

describe('AuthApi', () => {
  let api: AuthApi;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthApi, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: apiUrl }],
    });

    api = TestBed.inject(AuthApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      const mockResponse: UserResponse = {
        user: {
          email: 'test@example.com',
          username: 'testuser',
          bio: 'Test Bio',
          image: 'https://example.com/image.jpg',
        },
      };

      api.getCurrentUser().subscribe((user) => {
        expect(user).toEqual(mockResponse.user);
      });

      const req = httpMock.expectOne(`${apiUrl}/user`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('checkSession', () => {
    it('should return check session response', () => {
      const mockResponse: CheckSessionResponse = {
        authenticated: true,
        user: {
          email: 'test@example.com',
          username: 'testuser',
          bio: 'Test Bio',
          image: 'https://example.com/image.jpg',
        },
      };

      api.checkSession().subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/check-session`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('updateUser', () => {
    it('should update user and return updated user', () => {
      const userData: Partial<User> = {
        bio: 'Updated Bio',
      };
      const mockResponse: UserResponse = {
        user: {
          email: 'test@example.com',
          username: 'testuser',
          bio: 'Updated Bio',
          image: 'https://example.com/image.jpg',
        },
      };

      api.updateUser(userData).subscribe((user) => {
        expect(user).toEqual(mockResponse.user);
      });

      const req = httpMock.expectOne(`${apiUrl}/user`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ user: userData });
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should logout and return logout response', () => {
      const mockResponse: LogoutResponse = {
        success: true,
      };

      api.logout().subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });
});
