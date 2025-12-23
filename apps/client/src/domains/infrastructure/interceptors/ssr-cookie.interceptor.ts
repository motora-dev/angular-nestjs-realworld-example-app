import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID, REQUEST } from '@angular/core';

/**
 * SSR時にクッキーを転送するHTTPインターセプター
 * ブラウザからのリクエストでは`credentialsInterceptor`が`withCredentials: true`を設定するが、
 * SSR時（サーバー間のHTTPリクエスト）では`Cookie`ヘッダーを明示的に設定する必要がある
 */
export const ssrCookieInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const request = inject(REQUEST, { optional: true });

  // SSR時のみ処理
  if (!isPlatformServer(platformId) || !request) {
    return next(req);
  }

  // リクエストオブジェクトからクッキーを取得
  // Angular SSRでは、REQUESTトークンはExpressのRequestオブジェクトまたはWeb標準のRequestオブジェクトの可能性がある
  let cookies = '';

  // Web標準のRequestオブジェクトの場合（Headers API）
  if (request && 'headers' in request && typeof (request as any).headers.get === 'function') {
    cookies = (request as any).headers.get('cookie') || (request as any).headers.get('Cookie') || '';
  }
  // ExpressのRequestオブジェクトの場合
  else if (request && 'headers' in request) {
    const headers = (request as any).headers;
    cookies = headers?.['cookie'] || headers?.['Cookie'] || '';

    // cookie-parserが使われている場合、req.cookiesから取得
    if (!cookies && (request as any).cookies) {
      cookies = Object.entries((request as any).cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
    }
  }

  // クッキーが存在する場合のみ、Cookieヘッダーを設定
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
