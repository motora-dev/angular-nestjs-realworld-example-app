import { HttpRequest, HttpHandlerFn, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { credentialsInterceptor } from './credentials.interceptor';

describe('credentialsInterceptor', () => {
  let interceptor: typeof credentialsInterceptor;
  let next: HttpHandlerFn;
  let request: HttpRequest<unknown>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    interceptor = credentialsInterceptor;
    next = vi.fn(() => of({} as any));
    request = new HttpRequest('GET', '/test');
  });

  it('should set withCredentials to true on request', () => {
    const clonedRequestSpy = vi.spyOn(request, 'clone');
    interceptor(request, next);

    expect(clonedRequestSpy).toHaveBeenCalledWith({ withCredentials: true });
  });

  it('should call next handler with cloned request', () => {
    interceptor(request, next);

    expect(next).toHaveBeenCalled();
    const callArg = (next as ReturnType<typeof vi.fn>).mock.calls[0][0] as HttpRequest<unknown>;
    expect(callArg).toBeInstanceOf(HttpRequest);
    expect(callArg.withCredentials).toBe(true);
  });
});
