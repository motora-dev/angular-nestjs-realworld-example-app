import { DOCUMENT } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngxs/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { AuthFacade } from '$modules/auth';
import { AuthState } from '$modules/auth/store';
import { ErrorState } from '$modules/error/store';
import { SnackbarState } from '$modules/snackbar/store';
import { SpinnerState } from '$modules/spinner/store';
import { API_URL } from '$shared/lib';
import { App } from './app';

describe('App', () => {
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<App>;
  let component: App;
  let mockAuthFacade: {
    isAuthenticated$: Observable<boolean>;
    checkSession: ReturnType<typeof vi.fn>;
  };
  let originalRequestIdleCallback: typeof requestIdleCallback | undefined;
  let originalSetTimeout: typeof setTimeout;
  let originalRequestIdleCallbackExists: boolean;

  beforeEach(async () => {
    // Store original values
    originalRequestIdleCallbackExists = typeof globalThis.requestIdleCallback !== 'undefined';
    originalRequestIdleCallback = globalThis.requestIdleCallback;
    originalSetTimeout = globalThis.setTimeout;

    // Create mock AuthFacade
    const isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    mockAuthFacade = {
      isAuthenticated$: isAuthenticatedSubject.asObservable(),
      checkSession: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideStore([AuthState, ErrorState, SnackbarState, SpinnerState]),
        { provide: API_URL, useValue: 'http://localhost:3000' },
        { provide: AuthFacade, useValue: mockAuthFacade },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Destroy fixture and cleanup async operations
    if (fixture) {
      fixture.destroy();
    }
    httpMock.verify();

    // Restore mocks
    if (originalRequestIdleCallbackExists && originalRequestIdleCallback) {
      globalThis.requestIdleCallback = originalRequestIdleCallback;
    } else {
      delete (globalThis as any).requestIdleCallback;
    }
    globalThis.setTimeout = originalSetTimeout;
  });

  describe('Component initialization', () => {
    it('should create the app', async () => {
      fixture = TestBed.createComponent(App);
      component = fixture.componentInstance;
      expect(component).toBeTruthy();

      await fixture.whenStable();
    });

    it('should render header', async () => {
      fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-header')).toBeTruthy();
    });

    it('should render footer', async () => {
      fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-footer')).toBeTruthy();
    });

    it('should render router-outlet', async () => {
      fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('router-outlet')).toBeTruthy();
    });

    it('should render spinner component', async () => {
      fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-spinner')).toBeTruthy();
    });

    it('should render snackbar component', async () => {
      fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-snackbar')).toBeTruthy();
    });

    it('should render error dialog component', async () => {
      fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-error-dialog')).toBeTruthy();
    });

    it('should render cookie consent component', async () => {
      fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-cookie-consent')).toBeTruthy();
    });
  });

  describe('Platform browser detection', () => {
    it('should not call checkSession when platform is not browser', async () => {
      // Create a fresh mock for this test
      const isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
      const serverMockAuthFacade = {
        isAuthenticated$: isAuthenticatedSubject.asObservable(),
        checkSession: vi.fn(),
      };

      // Reset TestBed with server platform
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [App],
        providers: [
          provideRouter([]),
          provideHttpClient(),
          provideHttpClientTesting(),
          provideStore([AuthState, ErrorState, SnackbarState, SpinnerState]),
          { provide: API_URL, useValue: 'http://localhost:3000' },
          { provide: AuthFacade, useValue: serverMockAuthFacade },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(App);
      component = fixture.componentInstance;

      await fixture.whenStable();

      // Give some time for any async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      // checkSession should not be called on server platform
      expect(serverMockAuthFacade.checkSession).not.toHaveBeenCalled();
    });
  });

  describe('Preload functionality', () => {
    it('should call checkSession when requestIdleCallback is available', async () => {
      let idleCallback: IdleRequestCallback | null = null;

      globalThis.requestIdleCallback = ((callback: IdleRequestCallback) => {
        idleCallback = callback;
        return 0;
      }) as typeof requestIdleCallback;

      fixture = TestBed.createComponent(App);
      component = fixture.componentInstance;

      // Manually trigger the idle callback to execute preload
      if (idleCallback) {
        (idleCallback as IdleRequestCallback)({ didTimeout: false, timeRemaining: () => 0 });
      }

      await fixture.whenStable();

      expect(mockAuthFacade.checkSession).toHaveBeenCalled();
    });

    it('should fallback to setTimeout when requestIdleCallback is not available', async () => {
      delete (globalThis as any).requestIdleCallback;

      const originalSetTimeout = globalThis.setTimeout;
      globalThis.setTimeout = ((callback: () => void) => {
        // Execute immediately for testing
        callback();
        return 0;
      }) as typeof setTimeout;

      fixture = TestBed.createComponent(App);
      component = fixture.componentInstance;

      await fixture.whenStable();

      expect(mockAuthFacade.checkSession).toHaveBeenCalled();

      // Restore original setTimeout
      globalThis.setTimeout = originalSetTimeout;
    });

    it('should preload Material Symbols font when preload is executed', async () => {
      // Get the actual document from TestBed
      const realDocument = TestBed.inject(DOCUMENT);
      const createElementSpy = vi.spyOn(realDocument, 'createElement');
      const appendChildSpy = vi.spyOn(realDocument.head, 'appendChild');

      let idleCallback: IdleRequestCallback | null = null;
      globalThis.requestIdleCallback = ((callback: IdleRequestCallback) => {
        idleCallback = callback;
        return 0;
      }) as typeof requestIdleCallback;

      fixture = TestBed.createComponent(App);
      component = fixture.componentInstance;

      // Manually trigger the idle callback to execute preload
      if (idleCallback) {
        (idleCallback as IdleRequestCallback)({ didTimeout: false, timeRemaining: () => 0 });
      }

      await fixture.whenStable();

      // Find the call to createElement with 'link'
      const linkElementCalls = createElementSpy.mock.calls.filter((call: any[]) => call[0] === 'link');
      expect(linkElementCalls.length).toBeGreaterThan(0);

      // Get the link element from the last call with 'link' (should be our call)
      let lastLinkCallIndex = -1;
      for (let i = createElementSpy.mock.calls.length - 1; i >= 0; i--) {
        if (createElementSpy.mock.calls[i][0] === 'link') {
          lastLinkCallIndex = i;
          break;
        }
      }
      expect(lastLinkCallIndex).toBeGreaterThanOrEqual(0);
      const linkElement = createElementSpy.mock.results[lastLinkCallIndex].value as HTMLLinkElement;
      expect(linkElement).toBeInstanceOf(HTMLLinkElement);
      expect(linkElement.rel).toBe('stylesheet');
      expect(linkElement.href).toBe(
        'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap',
      );
      expect(appendChildSpy).toHaveBeenCalledWith(linkElement);

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
    });
  });

  describe('Authentication state', () => {
    it('should expose isAuthenticated$ observable from AuthFacade', async () => {
      fixture = TestBed.createComponent(App);
      component = fixture.componentInstance;

      expect(component.isAuthenticated$).toBeDefined();
      expect(component.isAuthenticated$).toBeInstanceOf(Observable);
    });

    it('should reflect authentication state changes', async () => {
      const isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
      const mockAuthFacadeWithSubject = {
        isAuthenticated$: isAuthenticatedSubject.asObservable(),
        checkSession: vi.fn(),
      };

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [App],
        providers: [
          provideRouter([]),
          provideHttpClient(),
          provideHttpClientTesting(),
          provideStore([AuthState, ErrorState, SnackbarState, SpinnerState]),
          { provide: API_URL, useValue: 'http://localhost:3000' },
          { provide: AuthFacade, useValue: mockAuthFacadeWithSubject },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(App);
      component = fixture.componentInstance;

      let authState: boolean | null = null;
      component.isAuthenticated$.subscribe((value) => {
        authState = value;
      });

      expect(authState).toBe(false);

      isAuthenticatedSubject.next(true);
      expect(authState).toBe(true);

      isAuthenticatedSubject.next(false);
      expect(authState).toBe(false);
    });
  });
});
