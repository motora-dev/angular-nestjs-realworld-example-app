import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

/**
 * ブラウザ環境でCookieからCSRFトークンを読み取り、HTTPヘッダーに設定するインターセプター
 *
 * withFetch()を使用している場合、withXsrfConfigurationはクロスオリジンリクエストで
 * 正しく動作しないため、明示的にCookieからCSRFトークンを読み取ってヘッダーに設定する必要があります。
 */
export const csrfTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // ブラウザ環境のみ処理
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  // document.cookieからXSRF-TOKENを取得
  const cookies = document.cookie.split(';');
  const xsrfCookie = cookies.find((cookie) => cookie.trim().startsWith('XSRF-TOKEN='));

  if (xsrfCookie) {
    const csrfToken = xsrfCookie.split('=')[1]?.trim();
    if (csrfToken) {
      // 既にx-xsrf-tokenヘッダーが設定されている場合は上書きしない
      // (withXsrfConfigurationが同一オリジンリクエストで設定した場合)
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
