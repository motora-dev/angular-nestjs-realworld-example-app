import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '$environments';
import { AuthApi, RegisterResponse } from './api';
import { User } from './model';
import { AuthState, ClearPendingRegistration, SetAuthenticated, SetCurrentUser, SetPendingRegistration } from './store';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly store = inject(Store);
  private readonly api = inject(AuthApi);

  readonly isAuthenticated$ = this.store.select(AuthState.isAuthenticated);
  readonly currentUser$ = this.store.select(AuthState.currentUser);
  readonly pendingRegistrationEmail$ = this.store.select(AuthState.pendingRegistrationEmail);

  checkSession(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.api.checkSession().subscribe((response) => {
      this.store.dispatch(new SetAuthenticated(response.authenticated));
      if (response.authenticated && response.user) {
        this.store.dispatch(new SetCurrentUser(response.user));
      }
    });
  }

  loadCurrentUser(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.api.getCurrentUser().subscribe((user) => {
      this.store.dispatch(new SetCurrentUser(user));
    });
  }

  updateUser(userData: Partial<User>): Observable<User> {
    return this.api.updateUser(userData).pipe(
      tap((user) => {
        this.store.dispatch(new SetCurrentUser(user));
      }),
    );
  }

  login(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.location.href = `${environment.apiUrl}/auth/login/google`;
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.api.logout().subscribe(() => {
      this.store.dispatch(new SetAuthenticated(false));
      this.store.dispatch(new SetCurrentUser(null));
    });
  }

  setPendingRegistration(email: string): void {
    this.store.dispatch(new SetPendingRegistration(email));
  }

  clearPendingRegistration(): void {
    this.store.dispatch(new ClearPendingRegistration());
  }

  register(username: string): Observable<RegisterResponse> {
    return this.api.register(username).pipe(
      tap(() => {
        this.store.dispatch(new ClearPendingRegistration());
        this.store.dispatch(new SetAuthenticated(true));
        // Note: We'll load the full user data after redirect
      }),
    );
  }
}
