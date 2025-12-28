import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { CookieConsentService } from './cookie-consent.service';

describe('CookieConsentService', () => {
  let service: CookieConsentService;
  let originalLocalStorage: Storage;
  let originalGtag: typeof window.gtag | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });

    originalLocalStorage = window.localStorage;
    originalGtag = window.gtag;

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock gtag
    window.gtag = vi.fn();

    service = TestBed.inject(CookieConsentService);
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
    if (originalGtag) {
      window.gtag = originalGtag;
    } else {
      delete (window as any).gtag;
    }
  });

  describe('initialization', () => {
    it('should initialize with null consent when no stored value', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
      const newService = TestBed.inject(CookieConsentService);
      expect(newService.consent()).toBeNull();
      expect(newService.isLoading()).toBe(false);
    });

    it('should initialize with stored accepted consent', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('accepted');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
      const newService = TestBed.inject(CookieConsentService);
      expect(newService.consent()).toBe('accepted');
      expect(newService.isLoading()).toBe(false);
    });

    it('should initialize with stored rejected consent', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('rejected');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
      const newService = TestBed.inject(CookieConsentService);
      expect(newService.consent()).toBe('rejected');
      expect(newService.isLoading()).toBe(false);
    });

    it('should call updateConsentMode when consent is accepted', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('accepted');
      vi.mocked(window.gtag).mockClear();
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
      TestBed.inject(CookieConsentService);
      expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    });

    it('should not call gtag when window.gtag is undefined during initialization', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('accepted');
      delete (window as any).gtag;
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
      expect(() => {
        const newService = TestBed.inject(CookieConsentService);
        expect(newService.consent()).toBe('accepted');
        expect(newService.isLoading()).toBe(false);
      }).not.toThrow();
      // gtag should not be called when it's undefined (check would fail if gtag was called)
    });

    it('should not call gtag when window.gtag is not a function during initialization', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('accepted');
      const originalGtag = window.gtag;
      (window as any).gtag = 'not-a-function';
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
      expect(() => {
        const newService = TestBed.inject(CookieConsentService);
        expect(newService.consent()).toBe('accepted');
        expect(newService.isLoading()).toBe(false);
      }).not.toThrow();
      // Restore original gtag for cleanup
      window.gtag = originalGtag;
    });

    it('should set isLoading to false on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
      });

      const serverService = TestBed.inject(CookieConsentService);
      expect(serverService.isLoading()).toBe(false);
    });
  });

  describe('acceptConsent', () => {
    it('should set consent to accepted and store in localStorage', () => {
      service.acceptConsent();
      expect(localStorage.setItem).toHaveBeenCalledWith('cookie-consent', 'accepted');
      expect(service.consent()).toBe('accepted');
    });

    it('should call updateConsentMode when accepting', () => {
      service.acceptConsent();
      expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    });

    it('should not call gtag when window.gtag is undefined', () => {
      const gtagSpy = vi.mocked(window.gtag);
      const callCountBefore = gtagSpy.mock.calls.length;
      delete (window as any).gtag;
      service.acceptConsent();
      expect(localStorage.setItem).toHaveBeenCalledWith('cookie-consent', 'accepted');
      expect(service.consent()).toBe('accepted');
      // gtag should not be called when it's undefined, so call count should not increase
      expect(gtagSpy.mock.calls.length).toBe(callCountBefore);
    });

    it('should not call gtag when window.gtag is not a function', () => {
      const gtagSpy = vi.mocked(window.gtag);
      const callCountBefore = gtagSpy.mock.calls.length;
      (window as any).gtag = 'not-a-function';
      service.acceptConsent();
      expect(localStorage.setItem).toHaveBeenCalledWith('cookie-consent', 'accepted');
      expect(service.consent()).toBe('accepted');
      // gtag should not be called when it's not a function, so call count should not increase
      expect(gtagSpy.mock.calls.length).toBe(callCountBefore);
    });

    it('should not accept consent on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
      });

      const serverService = TestBed.inject(CookieConsentService);
      serverService.acceptConsent();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should return early in updateConsentMode on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
      });

      const serverService = TestBed.inject(CookieConsentService);
      // Access private method using type assertion for testing purposes
      const updateConsentMode = (serverService as any).updateConsentMode.bind(serverService);

      // Should not throw and should return early without calling gtag
      const gtagSpy = vi.fn();
      window.gtag = gtagSpy;
      updateConsentMode('accepted');
      expect(gtagSpy).not.toHaveBeenCalled();

      updateConsentMode('rejected');
      expect(gtagSpy).not.toHaveBeenCalled();
    });
  });

  describe('rejectConsent', () => {
    it('should set consent to rejected and store in localStorage', () => {
      service.rejectConsent();
      expect(localStorage.setItem).toHaveBeenCalledWith('cookie-consent', 'rejected');
      expect(service.consent()).toBe('rejected');
    });

    it('should not call updateConsentMode when rejecting', () => {
      vi.mocked(window.gtag).mockClear();
      service.rejectConsent();
      expect(window.gtag).not.toHaveBeenCalled();
    });

    it('should not reject consent on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
      });

      const serverService = TestBed.inject(CookieConsentService);
      serverService.rejectConsent();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('resetConsent', () => {
    it('should remove consent from localStorage and reload page', () => {
      const originalLocation = window.location;
      const reloadSpy = vi.fn();
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...originalLocation,
          reload: reloadSpy,
        },
      });
      service.resetConsent();
      expect(localStorage.removeItem).toHaveBeenCalledWith('cookie-consent');
      expect(service.consent()).toBeNull();
      expect(reloadSpy).toHaveBeenCalled();
      Object.defineProperty(window, 'location', {
        writable: true,
        value: originalLocation,
      });
    });

    it('should not reset consent on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
      });

      const serverService = TestBed.inject(CookieConsentService);
      serverService.resetConsent();
      expect(localStorage.removeItem).not.toHaveBeenCalled();
    });
  });
});
