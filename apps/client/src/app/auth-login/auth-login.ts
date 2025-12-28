import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';

import { AuthFacade } from '$modules/auth';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [],
  templateUrl: './auth-login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLoginComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authFacade = inject(AuthFacade);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Redirect to home if already logged in
    this.authFacade.isAuthenticated$
      .pipe(
        filter((isAuthenticated): isAuthenticated is boolean => isAuthenticated === true),
        take(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  onGoogleLogin(): void {
    this.authFacade.login();
  }
}
