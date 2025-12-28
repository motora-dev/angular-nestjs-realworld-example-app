import { HttpRequest, HttpHandlerFn, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID, REQUEST } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ssrCookieInterceptor } from './ssr-cookie.interceptor';

describe('ssrCookieInterceptor', () => {
  let next: HttpHandlerFn;
  let request: HttpRequest<unknown>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: PLATFORM_ID, useValue: 'server' }],
    });

    next = vi.fn(() => of({} as any));
    request = new HttpRequest('GET', '/test');
  });

  it('should skip processing in browser environment', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: PLATFORM_ID, useValue: 'browser' }],
    });

    TestBed.runInInjectionContext(() => {
      ssrCookieInterceptor(request, next);
    });

    expect(next).toHaveBeenCalledWith(request);
  });

  it('should skip processing when REQUEST is not provided', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: PLATFORM_ID, useValue: 'server' }],
    });

    TestBed.runInInjectionContext(() => {
      ssrCookieInterceptor(request, next);
    });

    expect(next).toHaveBeenCalledWith(request);
  });

  it('should set Cookie header from Web standard Request headers', () => {
    const mockRequest = {
      headers: {
        get: vi.fn((name: string) => {
          if (name === 'cookie' || name === 'Cookie') {
            return 'test-cookie=value';
          }
          return null;
        }),
      },
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: REQUEST, useValue: mockRequest },
      ],
    });

    TestBed.runInInjectionContext(() => {
      ssrCookieInterceptor(request, next);
    });

    const callArg = (next as ReturnType<typeof vi.fn>).mock.calls[0][0] as HttpRequest<unknown>;
    expect(callArg.headers.get('Cookie')).toBe('test-cookie=value');
  });

  it('should set Cookie header from Express Request headers', () => {
    const mockRequest = {
      headers: {
        cookie: 'test-cookie=value',
      },
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: REQUEST, useValue: mockRequest },
      ],
    });

    TestBed.runInInjectionContext(() => {
      ssrCookieInterceptor(request, next);
    });

    const callArg = (next as ReturnType<typeof vi.fn>).mock.calls[0][0] as HttpRequest<unknown>;
    expect(callArg.headers.get('Cookie')).toBe('test-cookie=value');
  });

  it('should set Cookie header from Express Request cookies', () => {
    const mockRequest = {
      headers: {},
      cookies: {
        'test-cookie': 'value',
        'another-cookie': 'value2',
      },
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: REQUEST, useValue: mockRequest },
      ],
    });

    TestBed.runInInjectionContext(() => {
      ssrCookieInterceptor(request, next);
    });

    const callArg = (next as ReturnType<typeof vi.fn>).mock.calls[0][0] as HttpRequest<unknown>;
    const cookieHeader = callArg.headers.get('Cookie');
    expect(cookieHeader).toContain('test-cookie=value');
    expect(cookieHeader).toContain('another-cookie=value2');
  });

  it('should not set Cookie header when no cookies are present', () => {
    const mockRequest = {
      headers: {},
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: REQUEST, useValue: mockRequest },
      ],
    });

    TestBed.runInInjectionContext(() => {
      ssrCookieInterceptor(request, next);
    });

    expect(next).toHaveBeenCalledWith(request);
  });
});
