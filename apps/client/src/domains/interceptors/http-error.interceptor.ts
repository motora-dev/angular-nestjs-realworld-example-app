import { isPlatformBrowser } from "@angular/common";
import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
} from "@angular/common/http";
import { inject, PLATFORM_ID } from "@angular/core";
import { catchError, throwError } from "rxjs";

import { ErrorFacade } from "$modules/error";
import { ApiError, ServerError } from "$modules/error/error.model";

/** エラーハンドリングをスキップするためのコンテキストトークン */
export const SKIP_ERROR_HANDLING = new HttpContextToken<boolean>(() => false);

/** ページ遷移対象のステータスコード（ClientErrorHandler でページ遷移） */
const PAGE_NAVIGATE_STATUS_CODES = [401, 403, 404];

/** サーバーのメッセージをそのまま表示するステータスコード */
const SHOW_SERVER_MESSAGE_STATUS_CODES = [400, 409, 422, 429];

/**
 * HTTPエラーをキャッチしてエラーダイアログを表示するインターセプター
 * SSR環境ではスキップ、SKIP_ERROR_HANDLINGトークンでオプトアウト可能
 * 401/403/404 はダイアログ表示せず ClientErrorHandler でページ遷移
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // SSRならエラーハンドリングをスキップ
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const errorFacade = inject(ErrorFacade);

  return next(req).pipe(
    catchError((e: HttpErrorResponse) => {
      // 401/403/404 はダイアログ表示せず再スロー → ClientErrorHandler でページ遷移
      const shouldShowDialog =
        !req.context.get(SKIP_ERROR_HANDLING) &&
        !PAGE_NAVIGATE_STATUS_CODES.includes(e.status);

      if (shouldShowDialog) {
        const shouldShowServerMessage =
          SHOW_SERVER_MESSAGE_STATUS_CODES.includes(e.status);
        if (shouldShowServerMessage) {
          const serverError: ServerError = {
            type: "server",
            status: e.status,
            message: e.error?.message ?? "An unexpected error occurred",
          };
          errorFacade.showError(serverError);
        } else {
          const apiError: ApiError = {
            type: "api",
            errorCode: e.error?.errorCode ?? "500",
            message: e.error?.message ?? "An unexpected error occurred",
          };
          errorFacade.showError(apiError);
        }
      }
      return throwError(() => e);
    })
  );
};
