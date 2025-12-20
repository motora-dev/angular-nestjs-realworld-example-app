import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { environment } from '$environments';

export interface SeoMetaOptions {
  title: string;
  description: string;
  type?: 'website' | 'article';
  url?: string;
  tags?: string[];
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

  private readonly siteName = "もとら's dev";
  private readonly defaultDescription =
    'もとらによる技術ブログ。Web開発、NestJS、Angularなどの技術記事を発信しています。';
  private readonly baseUrl = environment.baseUrl;
  private readonly apiUrl = environment.apiUrl;

  /**
   * ページのメタデータを設定します
   */
  setPageMeta(options: SeoMetaOptions): void {
    const { title, description, type = 'website', url, tags = [] } = options;

    const fullTitle = title ? `${title} | ${this.siteName}` : this.siteName;
    const fullUrl = url ? `${this.baseUrl}${url}` : this.baseUrl;
    const ogImageUrl = options.imageUrl || this.buildOgImageUrl(title, tags);

    // Title
    this.titleService.setTitle(fullTitle);

    // Basic meta tags
    this.metaService.updateTag({ name: 'description', content: description });

    // Open Graph meta tags
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:type', content: type });
    this.metaService.updateTag({ property: 'og:url', content: fullUrl });
    this.metaService.updateTag({ property: 'og:site_name', content: this.siteName });
    this.metaService.updateTag({ property: 'og:image', content: ogImageUrl });

    // Twitter Card meta tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: ogImageUrl });
  }

  /**
   * デフォルトのメタデータをリセットします
   */
  resetToDefault(): void {
    this.setPageMeta({
      title: this.siteName,
      description: this.defaultDescription,
    });
  }

  /**
   * OG画像URLを構築します（NestJS APIのエンドポイント）
   */
  private buildOgImageUrl(title: string, tags: string[]): string {
    const params = new URLSearchParams();
    params.set('title', title);
    if (tags.length > 0) {
      params.set('tags', tags.slice(0, 3).join(','));
    }
    return `${this.apiUrl}/og?${params.toString()}`;
  }
}
