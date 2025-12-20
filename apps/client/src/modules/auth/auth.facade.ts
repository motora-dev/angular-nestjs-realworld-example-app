import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Store } from '@ngxs/store';

import { environment } from '$environments';
import { AuthApi } from './api';
import { AuthState, SetAuthenticated } from './store';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly store = inject(Store);
  private readonly api = inject(AuthApi);

  readonly isAuthenticated$ = this.store.select(AuthState.isAuthenticated);

  checkSession(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.api.checkSession().subscribe((response) => {
      this.store.dispatch(new SetAuthenticated(response.authenticated));
    });
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
    });
  }
}
