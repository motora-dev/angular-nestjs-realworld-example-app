import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

/**
 * Interceptor that reads CSRF token from cookie in browser environment and sets it in HTTP header
 *
 * When using withFetch(), withXsrfConfiguration doesn't work correctly for cross-origin requests,
 * so we need to explicitly read the CSRF token from the cookie and set it in the header.
 */
export const csrfTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // Only process in browser environment
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  // Get XSRF-TOKEN from document.cookie
  const cookies = document.cookie.split(';');
  const xsrfCookie = cookies.find((cookie) => cookie.trim().startsWith('XSRF-TOKEN='));

  if (xsrfCookie) {
    const csrfToken = xsrfCookie.split('=')[1]?.trim();
    if (csrfToken) {
      // Don't override if x-xsrf-token header is already set
      // (in case withXsrfConfiguration set it for same-origin requests)
      if (!req.headers.has('x-xsrf-token')) {
        const clonedRequest = req.clone({
          setHeaders: {
            'x-xsrf-token': csrfToken,
          },
        });
        return next(clonedRequest);
      }
    }
  }

  return next(req);
};
