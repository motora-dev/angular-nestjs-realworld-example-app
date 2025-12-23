import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthRegisterFacade } from '$domains/auth-register';
import { AuthFacade } from '$modules/auth';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './auth-callback.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCallbackComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authFacade = inject(AuthFacade);
  private readonly authRegisterFacade = inject(AuthRegisterFacade);

  readonly isNewUser = signal(false);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Get query parameters
    const isNewUser = this.route.snapshot.queryParamMap.get('isNewUser') === 'true';
    const email = this.route.snapshot.queryParamMap.get('email');

    this.isNewUser.set(isNewUser);

    if (isNewUser && email) {
      // New user - store email and redirect to register page
      this.authRegisterFacade.setPendingRegistration(email);
      setTimeout(() => {
        this.router.navigate(['/auth-register']);
      }, 1500);
    } else {
      // Existing user - update session and redirect to home
      this.authFacade.checkSession();
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1500);
    }
  }
}
