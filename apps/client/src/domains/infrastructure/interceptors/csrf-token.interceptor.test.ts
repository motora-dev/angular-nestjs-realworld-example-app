import { HttpRequest, HttpHandlerFn, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { csrfTokenInterceptor } from './csrf-token.interceptor';

describe('csrfTokenInterceptor', () => {
  let interceptor: typeof csrfTokenInterceptor;
  let next: HttpHandlerFn;
  let request: HttpRequest<unknown>;
  let originalDocumentCookie: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: PLATFORM_ID, useValue: 'browser' }],
    });

    interceptor = csrfTokenInterceptor;
    next = vi.fn(() => of({} as any));
    request = new HttpRequest('GET', '/test');

    originalDocumentCookie = document.cookie;
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  afterEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: originalDocumentCookie,
    });
  });

  it('should skip processing in SSR environment', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: PLATFORM_ID, useValue: 'server' }],
    });

    TestBed.runInInjectionContext(() => {
      csrfTokenInterceptor(request, next);
    });

    expect(next).toHaveBeenCalledWith(request);
  });

  it('should not modify request when XSRF-TOKEN cookie is not present', () => {
    document.cookie = 'other-cookie=value';
    TestBed.runInInjectionContext(() => {
      interceptor(request, next);
    });

    expect(next).toHaveBeenCalledWith(request);
  });

  it('should set x-xsrf-token header when XSRF-TOKEN cookie is present', () => {
    document.cookie = 'XSRF-TOKEN=test-token-value';
    TestBed.runInInjectionContext(() => {
      interceptor(request, next);
    });

    const callArg = (next as ReturnType<typeof vi.fn>).mock.calls[0][0] as HttpRequest<unknown>;
    expect(callArg.headers.get('x-xsrf-token')).toBe('test-token-value');
  });

  it('should not override existing x-xsrf-token header', () => {
    document.cookie = 'XSRF-TOKEN=test-token-value';
    const requestWithHeader = request.clone({
      setHeaders: {
        'x-xsrf-token': 'existing-token',
      },
    });
    TestBed.runInInjectionContext(() => {
      interceptor(requestWithHeader, next);
    });

    const callArg = (next as ReturnType<typeof vi.fn>).mock.calls[0][0] as HttpRequest<unknown>;
    expect(callArg.headers.get('x-xsrf-token')).toBe('existing-token');
  });

  it('should handle multiple cookies correctly', () => {
    document.cookie = 'cookie1=value1; XSRF-TOKEN=test-token; cookie2=value2';
    TestBed.runInInjectionContext(() => {
      interceptor(request, next);
    });

    const callArg = (next as ReturnType<typeof vi.fn>).mock.calls[0][0] as HttpRequest<unknown>;
    expect(callArg.headers.get('x-xsrf-token')).toBe('test-token');
  });
});
