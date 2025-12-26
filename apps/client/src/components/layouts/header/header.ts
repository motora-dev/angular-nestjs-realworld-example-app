import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RxLet } from '@rx-angular/template/let';
import { filter, map, startWith } from 'rxjs';

import { AuthFacade } from '$modules/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, TranslatePipe, RxLet],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacade);

  readonly isAuthenticated$ = this.authFacade.isAuthenticated$;
  readonly currentUser$ = this.authFacade.currentUser$;

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => (event as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url),
    ),
  );

  readonly showMenuButton = computed(() => {
    const url = this.currentUrl();
    return url?.startsWith('/article/') ?? false;
  });

  logout(): void {
    this.authFacade.logout();
  }
}
