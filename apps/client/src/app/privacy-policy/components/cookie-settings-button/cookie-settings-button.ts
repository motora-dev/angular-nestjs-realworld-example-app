import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { CookieConsentService } from '$modules/cookie-consent';

@Component({
  selector: 'app-cookie-settings-button',
  standalone: true,
  imports: [],
  templateUrl: './cookie-settings-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookieSettingsButtonComponent {
  private readonly cookieConsentService = inject(CookieConsentService);

  resetCookieSettings(): void {
    this.cookieConsentService.resetConsent();
  }
}
