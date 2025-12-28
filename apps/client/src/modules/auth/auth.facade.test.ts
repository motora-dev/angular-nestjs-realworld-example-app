import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { of } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { environment } from '$environments';
import { AuthApi, CheckSessionResponse } from './api';
import { AuthFacade } from './auth.facade';
import { User } from './model';
import { AuthState, SetAuthenticated, SetCurrentUser } from './store';

describe('AuthFacade', () => {
  let facade: AuthFacade;
  let store: Store;
  let authApi: AuthApi;

  const mockUser: User = {
    email: 'test@example.com',
    username: 'testuser',
    bio: 'Test Bio',
    image: 'https://example.com/image.jpg',
  };

  const mockCheckSessionResponse: CheckSessionResponse = {
    authenticated: true,
    user: mockUser,
  };

  beforeEach(() => {
    const mockAuthApi = {
      checkSession: vi.fn(() => of(mockCheckSessionResponse)),
      logout: vi.fn(() => of({ success: true })),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthFacade,
        provideStore([AuthState]),
        { provide: AuthApi, useValue: mockAuthApi },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    facade = TestBed.inject(AuthFacade);
    store = TestBed.inject(Store);
    authApi = TestBed.inject(AuthApi);
  });

  describe('checkSession', () => {
    it('should check session and dispatch SetAuthenticated and SetCurrentUser actions when authenticated', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.checkSession();

      expect(authApi.checkSession).toHaveBeenCalled();
      setTimeout(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(new SetAuthenticated(true));
        expect(dispatchSpy).toHaveBeenCalledWith(new SetCurrentUser(mockUser));
      }, 100);
    });

    it('should dispatch SetAuthenticated(false) and SetCurrentUser(null) when not authenticated', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      vi.mocked(authApi.checkSession).mockReturnValueOnce(of({ authenticated: false, user: undefined }));
      facade.checkSession();

      setTimeout(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(new SetAuthenticated(false));
        expect(dispatchSpy).toHaveBeenCalledWith(new SetCurrentUser(null));
      }, 100);
    });

    it('should not check session on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthFacade,
          provideStore([AuthState]),
          { provide: AuthApi, useValue: authApi },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });

      const serverFacade = TestBed.inject(AuthFacade);
      serverFacade.checkSession();

      expect(authApi.checkSession).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should redirect to Google login URL on browser platform', () => {
      const originalHref = window.location.href;
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          href: '',
        },
      });
      facade.login();

      expect(window.location.href).toBe(`${environment.apiUrl}/auth/login/google`);
      Object.defineProperty(window, 'location', {
        writable: true,
        value: originalHref,
      });
    });

    it('should not redirect on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthFacade,
          provideStore([AuthState]),
          { provide: AuthApi, useValue: authApi },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });

      const originalHref = window.location.href;
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          href: '',
        },
      });
      const serverFacade = TestBed.inject(AuthFacade);
      serverFacade.login();

      expect(window.location.href).toBe('');
      Object.defineProperty(window, 'location', {
        writable: true,
        value: originalHref,
      });
    });
  });

  describe('logout', () => {
    it('should logout and dispatch SetAuthenticated(false) and SetCurrentUser(null)', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.logout();

      expect(authApi.logout).toHaveBeenCalled();
      setTimeout(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(new SetAuthenticated(false));
        expect(dispatchSpy).toHaveBeenCalledWith(new SetCurrentUser(null));
      }, 100);
    });

    it('should not logout on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthFacade,
          provideStore([AuthState]),
          { provide: AuthApi, useValue: authApi },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });

      const serverFacade = TestBed.inject(AuthFacade);
      serverFacade.logout();

      expect(authApi.logout).not.toHaveBeenCalled();
    });
  });

  describe('selectors', () => {
    it('should expose isAuthenticated$ selector', () => {
      expect(facade.isAuthenticated$).toBeDefined();
    });

    it('should expose currentUser$ selector', () => {
      expect(facade.currentUser$).toBeDefined();
    });
  });
});
