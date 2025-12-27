import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { SeoService } from '$modules/seo';
import { CookieSettingsButtonComponent } from './components';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CookieSettingsButtonComponent],
  templateUrl: './privacy-policy.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPolicyComponent {
  private readonly seoService = inject(SeoService);

  constructor() {
    this.seoService.setPageMeta({
      title: $localize`:@@privacyPolicy.title:Privacy Policy`,
      description: $localize`:@@seo.privacyPolicy.description:Angular NestJS Example App respects the privacy of our users and strives to protect personal information.`,
      url: '/privacy-policy',
    });
  }
}
