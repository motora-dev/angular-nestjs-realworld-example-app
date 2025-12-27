import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

import { ErrorFacade } from '$modules/error';
import { NotFoundError } from '$modules/error/client-errors';
import { ClientError } from '$modules/error/error.model';

/** ページ遷移対象のステータスコードとルートのマッピング */
const PAGE_NAVIGATE_ROUTES: Record<number, string> = {
  401: '/error/401',
  403: '/error/403',
  404: '/error/404',
};

/**
 * クライアント側のエラーをキャッチしてエラーダイアログ表示またはページ遷移を行うハンドラー
 * - HttpErrorResponse 401/403/404: エラーページに遷移（URLは元のまま）
 * - HttpErrorResponse その他: httpErrorInterceptor で処理済みのためスキップ
 * - NotFoundError: 404エラーページに遷移（URLは元のまま）
 * - その他のエラー: エラーダイアログを表示
 * SSR環境では処理をスキップ
 */
@Injectable()
export class ClientErrorHandler implements ErrorHandler {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly errorFacade = inject(ErrorFacade);

  handleError(error: unknown): void {
    // SSRなら処理をスキップ
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // HttpErrorResponse の場合
    if (error instanceof HttpErrorResponse) {
      const route = PAGE_NAVIGATE_ROUTES[error.status];
      if (route) {
        // 401/403/404 → ページ遷移（URLは元のまま）
        this.router.navigate([route], { skipLocationChange: true });
      }
      // その他の HttpErrorResponse は httpErrorInterceptor で処理済み → スキップ
      return;
    }

    // NotFoundError の場合
    if (error instanceof NotFoundError) {
      const route = PAGE_NAVIGATE_ROUTES[error.statusCode];
      if (route) {
        // 404 → ページ遷移（URLは元のまま）
        this.router.navigate([route], { skipLocationChange: true });
      }
      return;
    }

    // HttpErrorResponse 以外（純粋なクライアントエラー）→ ダイアログ表示
    const clientError: ClientError = {
      type: 'client',
      message:
        error instanceof Error ? error.message : $localize`:@@error.unexpectedError:An unexpected error occurred`,
    };

    this.errorFacade.showError(clientError);
  }
}
