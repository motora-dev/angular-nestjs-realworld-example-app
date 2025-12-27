import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { ErrorFacade } from '$modules/error';

/**
 * Error code translation map using @angular/localize
 * Each error code maps to a localized message via $localize
 */
const ERROR_CODE_MESSAGES: Record<string, string> = {
  UNEXPECTED_ERROR: $localize`:@@errorCodes.UNEXPECTED_ERROR:An unexpected error occurred`,
  INTERNAL_SERVER_ERROR: $localize`:@@errorCodes.INTERNAL_SERVER_ERROR:Internal server error occurred`,
  UNAUTHORIZED: $localize`:@@errorCodes.UNAUTHORIZED:Authentication required`,
  FORBIDDEN: $localize`:@@errorCodes.FORBIDDEN:Access denied`,
  USER_NOT_FOUND: $localize`:@@errorCodes.USER_NOT_FOUND:User not found`,
  EMAIL_ALREADY_EXISTS: $localize`:@@errorCodes.EMAIL_ALREADY_EXISTS:This email is already in use`,
  USERNAME_ALREADY_EXISTS: $localize`:@@errorCodes.USERNAME_ALREADY_EXISTS:This username is already taken`,
  ARTICLE_NOT_FOUND: $localize`:@@errorCodes.ARTICLE_NOT_FOUND:Article not found`,
  COMMENT_NOT_FOUND: $localize`:@@errorCodes.COMMENT_NOT_FOUND:Comment not found`,
  VALIDATION_ERROR: $localize`:@@errorCodes.VALIDATION_ERROR:Input validation error`,
  USERNAME_REQUIRED: $localize`:@@errorCodes.USERNAME_REQUIRED:Username is required`,
  USERNAME_TOO_SHORT: $localize`:@@errorCodes.USERNAME_TOO_SHORT:Username is too short`,
  USERNAME_INVALID_FORMAT: $localize`:@@errorCodes.USERNAME_INVALID_FORMAT:Invalid username format`,
  EMAIL_INVALID: $localize`:@@errorCodes.EMAIL_INVALID:Invalid email format`,
  TITLE_REQUIRED: $localize`:@@errorCodes.TITLE_REQUIRED:Title is required`,
  DESCRIPTION_REQUIRED: $localize`:@@errorCodes.DESCRIPTION_REQUIRED:Description is required`,
  BODY_REQUIRED: $localize`:@@errorCodes.BODY_REQUIRED:Body is required`,
  COMMENT_BODY_REQUIRED: $localize`:@@errorCodes.COMMENT_BODY_REQUIRED:Comment body is required`,
};

/**
 * Get localized error message for a given error code
 */
function getErrorMessage(code: string): string {
  return ERROR_CODE_MESSAGES[code] ?? ERROR_CODE_MESSAGES['UNEXPECTED_ERROR'];
}

@Component({
  selector: 'app-error-dialog',
  standalone: true,
  imports: [],
  templateUrl: './error-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDialogComponent {
  private readonly errorFacade = inject(ErrorFacade);

  readonly error = toSignal(this.errorFacade.error$, { initialValue: null });

  readonly errorMessage = computed(() => {
    const err = this.error();
    if (err?.type === 'api') {
      return getErrorMessage(err.errorCode);
    }
    return getErrorMessage('UNEXPECTED_ERROR');
  });

  close(): void {
    this.errorFacade.clearError();
  }
}
