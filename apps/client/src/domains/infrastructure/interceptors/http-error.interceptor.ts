import { isPlatformBrowser } from '@angular/common';
import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ErrorFacade } from '$modules/error';
import { ApiError, ServerError } from '$modules/error/error.model';

/** Context token to skip error handling */
export const SKIP_ERROR_HANDLING = new HttpContextToken<boolean>(() => false);

/** Status codes that trigger page navigation (handled by ClientErrorHandler) */
const PAGE_NAVIGATE_STATUS_CODES = [401, 403, 404];

/** Status codes that display server messages as-is */
const SHOW_SERVER_MESSAGE_STATUS_CODES = [400, 409, 422, 429];

/**
 * Interceptor that catches HTTP errors and displays error dialog
 * Skipped in SSR environment, can opt out using SKIP_ERROR_HANDLING token
 * 401/403/404 don't show dialog, instead handled by ClientErrorHandler for page navigation
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // Skip error handling in SSR
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const errorFacade = inject(ErrorFacade);

  return next(req).pipe(
    catchError((e: HttpErrorResponse) => {
      // 401/403/404 don't show dialog, rethrow → ClientErrorHandler handles page navigation
      const shouldShowDialog = !req.context.get(SKIP_ERROR_HANDLING) && !PAGE_NAVIGATE_STATUS_CODES.includes(e.status);

      if (shouldShowDialog) {
        const shouldShowServerMessage = SHOW_SERVER_MESSAGE_STATUS_CODES.includes(e.status);
        if (shouldShowServerMessage) {
          const serverError: ServerError = {
            type: 'server',
            status: e.status,
            message: e.error?.message ?? 'An unexpected error occurred',
          };
          errorFacade.showError(serverError);
        } else {
          const apiError: ApiError = {
            type: 'api',
            errorCode: e.error?.errorCode ?? '500',
            message: e.error?.message ?? 'An unexpected error occurred',
          };
          errorFacade.showError(apiError);
        }
      }
      return throwError(() => e);
    }),
  );
};
