import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '$shared/lib';
import { ArticleListResponse } from './article-list.response';

@Injectable({ providedIn: 'root' })
export class ArticleListApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  getArticleList(): Observable<ArticleListResponse> {
    return this.http.get<ArticleListResponse>(`${this.baseUrl}/article-list`);
  }
}
