import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Store } from '@ngxs/store';

import { HideSnackbar, ShowSnackbar, SnackbarState } from './store';

@Injectable({ providedIn: 'root' })
export class SnackbarFacade {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly store = inject(Store);

  readonly snackbars$ = this.store.select(SnackbarState.getSnackbars);

  showSnackbar(
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    message: string,
    duration: number = 3000,
  ): void {
    if (isPlatformBrowser(this.platformId)) {
      this.store.dispatch(new ShowSnackbar(message, type, duration));
    }
  }

  hideSnackbar(id: string): void {
    if (isPlatformBrowser(this.platformId)) {
      this.store.dispatch(new HideSnackbar(id));
    }
  }
}
