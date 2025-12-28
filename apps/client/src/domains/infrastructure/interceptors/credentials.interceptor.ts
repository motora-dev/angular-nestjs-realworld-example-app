import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor that sets withCredentials: true on all HTTP requests
 * Required for cookie-based authentication (including CSRF protection)
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ withCredentials: true }));
};
