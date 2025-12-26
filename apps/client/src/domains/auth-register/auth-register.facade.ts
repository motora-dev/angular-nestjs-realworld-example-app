import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { SetAuthenticated } from '$modules/auth/store';
import { SpinnerFacade } from '$modules/spinner';
import { AuthRegisterApi, RegisterResponse } from './api';
import { AuthRegisterState, ClearPendingRegistration, SetPendingRegistration } from './store';

@Injectable({ providedIn: 'root' })
export class AuthRegisterFacade {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly store = inject(Store);
  private readonly api = inject(AuthRegisterApi);
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly pendingRegistrationEmail$ = this.store.select(AuthRegisterState.pendingRegistrationEmail);

  setPendingRegistration(email: string): void {
    this.store.dispatch(new SetPendingRegistration(email));
  }

  clearPendingRegistration(): void {
    this.store.dispatch(new ClearPendingRegistration());
  }

  register(username: string): Observable<RegisterResponse> {
    return this.api.register(username).pipe(
      this.spinnerFacade.withSpinner(),
      tap(() => {
        this.store.dispatch(new ClearPendingRegistration());
        this.store.dispatch(new SetAuthenticated(true));
      }),
    );
  }

  loadPendingRegistration(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.api.getPendingRegistration().subscribe((response) => {
      if (response?.email) {
        this.store.dispatch(new SetPendingRegistration(response.email));
      }
    });
  }
}
