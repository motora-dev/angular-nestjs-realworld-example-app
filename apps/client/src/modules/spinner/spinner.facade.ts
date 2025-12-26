import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Store } from '@ngxs/store';
import { defer, finalize, forkJoin, map, MonoTypeOperatorFunction, timer } from 'rxjs';

import { HideSpinner, ShowSpinner, SpinnerState } from './store';

/** スピナーの最小表示時間（ミリ秒） */
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
   * Observableをラップして自動的にスピナーを制御するオペレーター
   * subscribe時にスピナーを表示し、complete/error時に非表示にする
   * 最小表示時間を保証し、ちらつきを防止する
   * サーバー側ではスピナー制御をスキップ
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
