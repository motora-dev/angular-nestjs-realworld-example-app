import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '$shared/lib';
import { GetFirstPageIdResponse } from './article.response';

@Injectable({ providedIn: 'root' })
export class ArticleApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  getFirstPageId(articleId: string): Observable<GetFirstPageIdResponse> {
    return this.http.get<GetFirstPageIdResponse>(`${this.baseUrl}/article/${articleId}/first-page-id`);
  }
}
