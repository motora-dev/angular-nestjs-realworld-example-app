import { HttpInterceptorFn } from '@angular/common/http';

/**
 * すべてのHTTPリクエストに withCredentials: true を設定するInterceptor
 * Cookieベースの認証（CSRF対応含む）で必要
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ withCredentials: true }));
};
