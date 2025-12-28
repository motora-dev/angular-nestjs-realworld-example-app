import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { API_URL } from '$shared/lib';
import { AuthRegisterApi } from './auth-register.api';
import { PendingRegistrationResponse, RegisterResponse } from './auth-register.response';

describe('AuthRegisterApi', () => {
  let api: AuthRegisterApi;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthRegisterApi,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: apiUrl },
      ],
    });

    api = TestBed.inject(AuthRegisterApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getPendingRegistration', () => {
    it('should return pending registration response', () => {
      const mockResponse: PendingRegistrationResponse = {
        email: 'test@example.com',
      };

      api.getPendingRegistration().subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/pending-registration`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return null when no pending registration', () => {
      api.getPendingRegistration().subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/pending-registration`);
      req.flush(null);
    });
  });

  describe('register', () => {
    it('should register user and return register response', () => {
      const username = 'testuser';
      const mockResponse: RegisterResponse = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
      };

      api.register(username).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username });
      req.flush(mockResponse);
    });
  });
});
