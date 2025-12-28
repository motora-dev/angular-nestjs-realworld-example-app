import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID, REQUEST } from '@angular/core';

/**
 * HTTP interceptor that forwards cookies during SSR
 * Browser requests use `credentialsInterceptor` to set `withCredentials: true`,
 * but SSR (server-to-server HTTP requests) requires explicit `Cookie` header
 */
export const ssrCookieInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const request = inject(REQUEST, { optional: true });

  // Only process during SSR
  if (!isPlatformServer(platformId) || !request) {
    return next(req);
  }

  // Get cookies from request object
  // In Angular SSR, the REQUEST token can be either an Express Request object or a Web standard Request object
  let cookies = '';

  // Web standard Request object (Headers API)
  if (request && 'headers' in request && typeof (request as any).headers.get === 'function') {
    cookies = (request as any).headers.get('cookie') || (request as any).headers.get('Cookie') || '';
  }
  // Express Request object
  else if (request && 'headers' in request) {
    const headers = (request as any).headers;
    cookies = headers?.['cookie'] || headers?.['Cookie'] || '';

    // If cookie-parser is used, get from req.cookies
    if (!cookies && (request as any).cookies) {
      cookies = Object.entries((request as any).cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
    }
  }

  // Set Cookie header only if cookies exist
  if (cookies) {
    const clonedRequest = req.clone({
      setHeaders: {
        Cookie: cookies,
      },
    });
    return next(clonedRequest);
  }

  return next(req);
};
