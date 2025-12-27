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

  private readonly baseUrl = environment.baseUrl;
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get site name from translation
   */
  private get siteName(): string {
    return $localize`:@@seo.siteName:conduit`;
  }

  /**
   * Get default description from translation
   */
  private get defaultDescription(): string {
    return $localize`:@@seo.defaultDescription:A place to share your Angular knowledge.`;
  }

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
    const defaultTitle = $localize`:@@seo.defaultTitle:conduit - Angular + NestJS RealWorld Example App`;
    this.setPageMeta({
      title: defaultTitle,
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
