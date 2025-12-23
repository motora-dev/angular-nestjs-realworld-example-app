import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_URL } from '$shared/lib';
import { Article } from '../model';
import { ArticleResponse, SingleArticleResponse } from './article.response';

@Injectable({ providedIn: 'root' })
export class ArticleApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  get(slug: string): Observable<ArticleResponse> {
    return this.http.get<SingleArticleResponse>(`${this.apiUrl}/articles/${slug}`).pipe(map((data) => data.article));
  }

  create(article: Partial<Article>): Observable<ArticleResponse> {
    return this.http
      .post<SingleArticleResponse>(`${this.apiUrl}/articles`, { article })
      .pipe(map((data) => data.article));
  }

  update(article: Partial<Article>): Observable<ArticleResponse> {
    return this.http
      .put<SingleArticleResponse>(`${this.apiUrl}/articles/${article.slug}`, { article })
      .pipe(map((data) => data.article));
  }

  delete(slug: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/articles/${slug}`);
  }

  favorite(slug: string): Observable<ArticleResponse> {
    return this.http
      .post<SingleArticleResponse>(`${this.apiUrl}/articles/${slug}/favorite`, {})
      .pipe(map((data) => data.article));
  }

  unfavorite(slug: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/articles/${slug}/favorite`);
  }
}
