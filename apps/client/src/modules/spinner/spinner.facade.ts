import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Store } from '@ngxs/store';
import { defer, finalize, forkJoin, map, MonoTypeOperatorFunction, timer } from 'rxjs';

import { HideSpinner, ShowSpinner, SpinnerState } from './store';

/** Minimum display time for spinner (milliseconds) */
const MIN_DISPLAY_TIME = 300;

@Injectable({ providedIn: 'root' })
export class SpinnerFacade {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly store = inject(Store);

  readonly isLoading$ = this.store.select(SpinnerState.isLoading);
  readonly message$ = this.store.select(SpinnerState.getMessage);

  showSpinner(message?: string): void {
    if (isPlatformBrowser(this.platformId)) {
      this.store.dispatch(new ShowSpinner(message));
    }
  }

  hideSpinner(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.store.dispatch(new HideSpinner());
    }
  }

  /**
   * Operator that wraps an Observable to automatically control the spinner
   * Shows spinner on subscribe, hides on complete/error
   * Guarantees minimum display time to prevent flickering
   * Skips spinner control on server side
   */
  withSpinner<T>(message?: string): MonoTypeOperatorFunction<T> {
    return (source) =>
      defer(() => {
        this.showSpinner(message);

        if (isPlatformBrowser(this.platformId)) {
          return forkJoin({
            result: source,
            minTimer: timer(MIN_DISPLAY_TIME),
          }).pipe(
            map(({ result }) => result),
            finalize(() => this.hideSpinner()),
          );
        }

        return source;
      });
  }
}
