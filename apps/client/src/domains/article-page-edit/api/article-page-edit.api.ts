import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '$shared/lib';
import { GetPageResponse, GetPagesResponse, UpdatePageRequest, UpdatePageResponse } from './article-page-edit.response';

@Injectable({ providedIn: 'root' })
export class ArticlePageEditApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  getPages(articleId: string): Observable<GetPagesResponse> {
    return this.http.get<GetPagesResponse>(`${this.baseUrl}/article-page-edit/${articleId}/page`);
  }

  getPage(articleId: string, pageId: string): Observable<GetPageResponse> {
    return this.http.get<GetPageResponse>(`${this.baseUrl}/article-page-edit/${articleId}/page/${pageId}`);
  }

  updatePage(articleId: string, pageId: string, request: UpdatePageRequest): Observable<UpdatePageResponse> {
    return this.http.put<UpdatePageResponse>(`${this.baseUrl}/article-page-edit/${articleId}/page/${pageId}`, request);
  }
}
