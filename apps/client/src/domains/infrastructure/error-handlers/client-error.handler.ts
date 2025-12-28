import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

import { ErrorFacade } from '$modules/error';
import { NotFoundError } from '$modules/error/client-errors';
import { ClientError } from '$modules/error/error.model';

/** Mapping of status codes and routes for page navigation */
const PAGE_NAVIGATE_ROUTES: Record<number, string> = {
  401: '/error/401',
  403: '/error/403',
  404: '/error/404',
};

/**
 * Handler that catches client-side errors and displays error dialog or navigates to error page
 * - HttpErrorResponse 401/403/404: Navigate to error page (URL remains unchanged)
 * - HttpErrorResponse others: Skip (already handled by httpErrorInterceptor)
 * - NotFoundError: Navigate to 404 error page (URL remains unchanged)
 * - Other errors: Display error dialog
 * Skip processing in SSR environment
 */
@Injectable()
export class ClientErrorHandler implements ErrorHandler {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly errorFacade = inject(ErrorFacade);

  handleError(error: unknown): void {
    // Skip processing in SSR
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // For HttpErrorResponse
    if (error instanceof HttpErrorResponse) {
      const route = PAGE_NAVIGATE_ROUTES[error.status];
      if (route) {
        // 401/403/404 → Navigate to page (URL remains unchanged)
        this.router.navigate([route], { skipLocationChange: true });
      }
      // Other HttpErrorResponse already handled by httpErrorInterceptor → Skip
      return;
    }

    // For NotFoundError
    if (error instanceof NotFoundError) {
      const route = PAGE_NAVIGATE_ROUTES[error.statusCode];
      if (route) {
        // 404 → Navigate to page (URL remains unchanged)
        this.router.navigate([route], { skipLocationChange: true });
      }
      return;
    }

    // Other than HttpErrorResponse (pure client error) → Display dialog
    const clientError: ClientError = {
      type: 'client',
      message:
        error instanceof Error ? error.message : $localize`:@@error.unexpectedError:An unexpected error occurred`,
    };

    this.errorFacade.showError(clientError);
  }
}
