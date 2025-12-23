import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ArticleListConfig } from '$domains/article';
import { API_URL } from '$shared/lib';
import { ArticlesResponse, TagsResponse } from './home.response';

@Injectable({ providedIn: 'root' })
export class HomeApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getTags(): Observable<TagsResponse> {
    return this.http.get<TagsResponse>(`${this.apiUrl}/tags`);
  }

  getArticles(config: ArticleListConfig): Observable<ArticlesResponse> {
    let params = new HttpParams();

    Object.entries(config.filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params = params.set(key, String(value));
      }
    });

    const endpoint = config.type === 'feed' ? '/articles/feed' : '/articles';
    return this.http.get<ArticlesResponse>(`${this.apiUrl}${endpoint}`, { params });
  }
}
