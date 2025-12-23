import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { CommentsApi, CommentResponse } from './api';
import { Comment } from './model';
import { AddComment, ClearComments, CommentsState, RemoveComment, SetComments } from './store';

@Injectable()
export class CommentsFacade {
  private readonly store = inject(Store);
  private readonly api = inject(CommentsApi);

  readonly comments$ = this.store.select(CommentsState.getComments);

  private mapResponseToComment(response: CommentResponse): Comment {
    return {
      id: response.id,
      body: response.body,
      createdAt: new Date(response.createdAt),
      author: response.author,
    };
  }

  loadComments(slug: string): void {
    this.api.getAll(slug).subscribe((responses) => {
      const comments = responses.map((r) => this.mapResponseToComment(r));
      this.store.dispatch(new SetComments(comments));
    });
  }

  addComment(slug: string, body: string): Observable<Comment> {
    return this.api.add(slug, body).pipe(
      tap((response) => {
        const comment = this.mapResponseToComment(response);
        this.store.dispatch(new AddComment(comment));
      }),

      tap((response: any) => response as unknown as Comment),
    );
  }

  deleteComment(commentId: string, slug: string): Observable<void> {
    return this.api.delete(commentId, slug).pipe(
      tap(() => {
        this.store.dispatch(new RemoveComment(commentId));
      }),
    );
  }

  clearComments(): void {
    this.store.dispatch(new ClearComments());
  }
}
