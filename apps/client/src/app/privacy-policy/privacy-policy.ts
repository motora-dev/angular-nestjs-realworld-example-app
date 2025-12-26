import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SeoService } from '$modules/seo';
import { CookieSettingsButtonComponent } from './components';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CookieSettingsButtonComponent, TranslateModule],
  templateUrl: './privacy-policy.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPolicyComponent {
  private readonly seoService = inject(SeoService);
  private readonly translateService = inject(TranslateService);

  constructor() {
    const title = this.translateService.instant('privacyPolicy.title');
    const description = this.translateService.instant('privacyPolicy.sections.introduction.content');
    this.seoService.setPageMeta({
      title,
      description,
      url: '/privacy-policy',
    });
  }
}
