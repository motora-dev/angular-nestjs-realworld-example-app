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
      title: 'プライバシーポリシー',
      description: "もとら's dev のプライバシーポリシー",
      url: '/privacy-policy',
    });
  }
}
