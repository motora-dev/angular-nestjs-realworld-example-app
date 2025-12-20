import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CookieConsentService } from '$modules/cookie-consent';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cookie-consent.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookieConsentComponent {
  private readonly cookieConsentService = inject(CookieConsentService);

  readonly consent = this.cookieConsentService.consent;
  readonly isLoading = this.cookieConsentService.isLoading;

  accept(): void {
    this.cookieConsentService.acceptConsent();
  }

  reject(): void {
    this.cookieConsentService.rejectConsent();
  }
}
