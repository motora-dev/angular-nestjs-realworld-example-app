import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, of } from 'rxjs';

import { environment } from '$environments';

interface InvalidateCacheResponse {
  status: string;
}

@Injectable({ providedIn: 'root' })
export class IsrService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  /**
   * Invalidate ISR cache for the specified URLs.
   * This calls the SSR server's /api/invalidate-cache endpoint.
   *
   * @param urlsToInvalidate Array of URLs to invalidate (e.g., ['/article/xxx/yyy'])
   * @returns Observable that completes when invalidation is done
   */
  invalidateUrls(urlsToInvalidate: string[]): Observable<InvalidateCacheResponse | null> {
    // Only run in browser (not during SSR)
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }

    if (urlsToInvalidate.length === 0) {
      return of(null);
    }

    return this.http.post<InvalidateCacheResponse>(`${this.baseUrl}/api/invalidate-cache`, {
      urlsToInvalidate,
    });
  }

  /**
   * Invalidate ISR cache for an article page.
   *
   * @param articleId The article's public ID
   * @param pageId The page's public ID
   */
  invalidateArticlePage(articleId: string, pageId: string): Observable<InvalidateCacheResponse | null> {
    return this.invalidateUrls([`/article/${articleId}/${pageId}`]);
  }

  /**
   * Invalidate ISR cache for all pages of an article.
   *
   * @param articleId The article's public ID
   * @param pageIds Array of page public IDs
   */
  invalidateArticlePages(articleId: string, pageIds: string[]): Observable<InvalidateCacheResponse | null> {
    const urls = pageIds.map((pageId) => `/article/${articleId}/${pageId}`);
    return this.invalidateUrls(urls);
  }
}
