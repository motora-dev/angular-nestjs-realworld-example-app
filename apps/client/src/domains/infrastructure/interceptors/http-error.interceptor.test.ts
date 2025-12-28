import { HttpRequest, HttpErrorResponse, HttpContext, HttpHandlerFn, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ErrorFacade } from '$modules/error';
import { SKIP_ERROR_HANDLING, httpErrorInterceptor } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  let interceptor: typeof httpErrorInterceptor;
  let next: HttpHandlerFn;
  let request: HttpRequest<unknown>;
  let errorFacade: ErrorFacade;

  beforeEach(() => {
    const mockErrorFacade = {
      showError: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ErrorFacade, useValue: mockErrorFacade },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    interceptor = httpErrorInterceptor;
    errorFacade = TestBed.inject(ErrorFacade);
    next = vi.fn(() => of({} as any));
    request = new HttpRequest('GET', '/test');
  });

  it('should skip processing in SSR environment', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ErrorFacade, useValue: errorFacade },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    const serverNext = vi.fn(() => of({} as any));
    TestBed.runInInjectionContext(() => {
      httpErrorInterceptor(request, serverNext);
    });

    expect(serverNext).toHaveBeenCalled();
  });

  it('should skip error handling when SKIP_ERROR_HANDLING is true', () => {
    const requestWithSkip = request.clone({
      context: new HttpContext().set(SKIP_ERROR_HANDLING, true),
    });
    const error = new HttpErrorResponse({ status: 500 });
    vi.mocked(next).mockReturnValueOnce(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      interceptor(requestWithSkip, next).subscribe({
        error: (e) => {
          expect(e).toBe(error);
          expect(errorFacade.showError).not.toHaveBeenCalled();
        },
      });
    });
  });

  it('should not show dialog for 401 status code', () => {
    const error = new HttpErrorResponse({ status: 401 });
    vi.mocked(next).mockReturnValueOnce(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      interceptor(request, next).subscribe({
        error: (e) => {
          expect(e).toBe(error);
          expect(errorFacade.showError).not.toHaveBeenCalled();
        },
      });
    });
  });

  it('should not show dialog for 403 status code', () => {
    const error = new HttpErrorResponse({ status: 403 });
    vi.mocked(next).mockReturnValueOnce(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      interceptor(request, next).subscribe({
        error: (e) => {
          expect(e).toBe(error);
          expect(errorFacade.showError).not.toHaveBeenCalled();
        },
      });
    });
  });

  it('should not show dialog for 404 status code', () => {
    const error = new HttpErrorResponse({ status: 404 });
    vi.mocked(next).mockReturnValueOnce(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      interceptor(request, next).subscribe({
        error: (e) => {
          expect(e).toBe(error);
          expect(errorFacade.showError).not.toHaveBeenCalled();
        },
      });
    });
  });

  it('should show server error for 400 status code', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { message: 'Bad Request' },
    });
    vi.mocked(next).mockReturnValueOnce(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      interceptor(request, next).subscribe({
        error: (e) => {
          expect(e).toBe(error);
          expect(errorFacade.showError).toHaveBeenCalledWith({
            type: 'server',
            status: 400,
            message: 'Bad Request',
          });
        },
      });
    });
  });

  it('should show server error for 422 status code', () => {
    const error = new HttpErrorResponse({
      status: 422,
      error: { message: 'Validation Failed' },
    });
    vi.mocked(next).mockReturnValueOnce(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      interceptor(request, next).subscribe({
        error: (e) => {
          expect(e).toBe(error);
          expect(errorFacade.showError).toHaveBeenCalledWith({
            type: 'server',
            status: 422,
            message: 'Validation Failed',
          });
        },
      });
    });
  });

  it('should show api error for 500 status code', () => {
    const error = new HttpErrorResponse({
      status: 500,
      error: { errorCode: '500', message: 'Internal Server Error' },
    });
    vi.mocked(next).mockReturnValueOnce(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      interceptor(request, next).subscribe({
        error: (e) => {
          expect(e).toBe(error);
          expect(errorFacade.showError).toHaveBeenCalledWith({
            type: 'api',
            errorCode: '500',
            message: 'Internal Server Error',
          });
        },
      });
    });
  });

  it('should use default message when error message is not present', () => {
    const error = new HttpErrorResponse({ status: 500 });
    vi.mocked(next).mockReturnValueOnce(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      interceptor(request, next).subscribe({
        error: (e) => {
          expect(e).toBe(error);
          expect(errorFacade.showError).toHaveBeenCalledWith({
            type: 'api',
            errorCode: '500',
            message: 'An unexpected error occurred',
          });
        },
      });
    });
  });
});
