import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '$shared/lib';
import { GetArticleResponse, UpdateArticleRequest, UpdateArticleResponse } from './article-edit.response';

@Injectable({ providedIn: 'root' })
export class ArticleEditApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  getArticle(articleId: string): Observable<GetArticleResponse> {
    return this.http.get<GetArticleResponse>(`${this.baseUrl}/article/edit/${articleId}`);
  }

  updateArticle(articleId: string, request: UpdateArticleRequest): Observable<UpdateArticleResponse> {
    return this.http.put<UpdateArticleResponse>(`${this.baseUrl}/article/update/${articleId}`, request);
  }
}
