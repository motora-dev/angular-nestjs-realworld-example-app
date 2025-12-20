import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthFacade } from '$modules/auth';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './callback.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallbackComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacade);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // セッション状態を更新
    this.authFacade.checkSession();

    // 3秒後にホームへリダイレクト
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 3000);
  }
}
