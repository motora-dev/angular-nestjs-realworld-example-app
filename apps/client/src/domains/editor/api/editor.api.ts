import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_URL } from '$shared/lib';
import { EditorArticle } from '../model';
import { ArticleResponse, SingleArticleResponse } from './editor.response';

@Injectable({ providedIn: 'root' })
export class EditorApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  get(slug: string): Observable<ArticleResponse> {
    return this.http.get<SingleArticleResponse>(`${this.apiUrl}/articles/${slug}`).pipe(map((data) => data.article));
  }

  create(article: Partial<EditorArticle>): Observable<ArticleResponse> {
    return this.http
      .post<SingleArticleResponse>(`${this.apiUrl}/articles`, { article })
      .pipe(map((data) => data.article));
  }

  update(article: Partial<EditorArticle>): Observable<ArticleResponse> {
    return this.http
      .put<SingleArticleResponse>(`${this.apiUrl}/articles/${article.slug}`, { article })
      .pipe(map((data) => data.article));
  }
}
