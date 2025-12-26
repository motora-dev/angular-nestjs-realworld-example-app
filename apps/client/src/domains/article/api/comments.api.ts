import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_URL } from '$shared/lib';
import { CommentResponse, CommentsResponse, SingleCommentResponse } from './comments.response';

@Injectable({ providedIn: 'root' })
export class CommentsApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getAll(slug: string): Observable<CommentResponse[]> {
    return this.http
      .get<CommentsResponse>(`${this.apiUrl}/articles/${slug}/comments`)
      .pipe(map((data) => data.comments));
  }

  add(slug: string, body: string): Observable<CommentResponse> {
    return this.http
      .post<SingleCommentResponse>(`${this.apiUrl}/articles/${slug}/comments`, {
        comment: { body },
      })
      .pipe(map((data) => data.comment));
  }

  delete(commentId: string, slug: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/articles/${slug}/comments/${commentId}`);
  }
}
