import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter, take } from 'rxjs';

import { AuthFacade } from '$modules/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authFacade = inject(AuthFacade);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // 既にログイン済みの場合はホームへリダイレクト
    this.authFacade.isAuthenticated$
      .pipe(
        filter((isAuthenticated) => isAuthenticated),
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
