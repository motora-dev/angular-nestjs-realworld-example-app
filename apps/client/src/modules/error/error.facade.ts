import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Store } from '@ngxs/store';

import { AppError } from './error.model';
import { ClearError, ErrorState, ShowError } from './store';

@Injectable({ providedIn: 'root' })
export class ErrorFacade {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly store = inject(Store);

  readonly error$ = this.store.select(ErrorState.error);

  showError(error: AppError): void {
    if (isPlatformBrowser(this.platformId)) {
      this.store.dispatch(new ShowError(error));
    }
  }

  clearError(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.store.dispatch(new ClearError());
    }
  }
}
