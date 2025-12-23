import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { SpinnerFacade } from '$modules/spinner';
import { ArticleApi, ArticleResponse, CommentResponse, CommentsApi } from './api';
import { Article, Comment } from './model';
import {
  AddComment,
  ArticleState,
  ClearArticle,
  ClearCommentForm,
  ClearComments,
  CommentsState,
  RemoveComment,
  SetArticle,
  SetComments,
} from './store';

@Injectable()
export class ArticleFacade {
  private readonly store = inject(Store);
  private readonly articleApi = inject(ArticleApi);
  private readonly commentsApi = inject(CommentsApi);
  private readonly router = inject(Router);
  private readonly spinnerFacade = inject(SpinnerFacade);

  // Article selectors
  readonly article$ = this.store.select(ArticleState.getArticle);

  // Comments selectors
  readonly comments$ = this.store.select(CommentsState.getComments);
  readonly isCommentFormInvalid$ = this.store.select(CommentsState.isCommentFormInvalid);

  // Article methods
  private mapResponseToArticle(response: ArticleResponse): Article {
    return {
      slug: response.slug,
      title: response.title,
      description: response.description,
      body: response.body,
      tagList: response.tagList,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      favorited: response.favorited,
      favoritesCount: response.favoritesCount,
      author: response.author,
    };
  }

  loadArticle(slug: string): void {
    this.articleApi
      .get(slug)
      .pipe(this.spinnerFacade.withSpinner())
      .subscribe((response) => {
        const article = this.mapResponseToArticle(response);
        this.store.dispatch(new SetArticle(article));
      });
  }

  deleteArticle(slug: string): Observable<void> {
    return this.articleApi.delete(slug).pipe(
      this.spinnerFacade.withSpinner(),
      tap(() => {
        this.store.dispatch(new ClearArticle());
        this.router.navigate(['/']);
      }),
    );
  }

  favoriteArticle(slug: string): Observable<Article> {
    return this.articleApi.favorite(slug).pipe(
      map((response) => this.mapResponseToArticle(response)),
      tap((article) => {
        this.store.dispatch(new SetArticle(article));
      }),
    );
  }

  unfavoriteArticle(slug: string): Observable<void> {
    return this.articleApi.unfavorite(slug);
  }

  clearArticle(): void {
    this.store.dispatch(new ClearArticle());
  }

  // Comments methods
  private mapResponseToComment(response: CommentResponse): Comment {
    return {
      id: response.id,
      body: response.body,
      createdAt: new Date(response.createdAt),
      author: response.author,
    };
  }

  loadComments(slug: string): void {
    this.commentsApi.getAll(slug).subscribe((responses) => {
      const comments = responses.map((r) => this.mapResponseToComment(r));
      this.store.dispatch(new SetComments(comments));
    });
  }

  addComment(slug: string, body: string): Observable<Comment> {
    return this.commentsApi.add(slug, body).pipe(
      this.spinnerFacade.withSpinner(),
      map((response) => this.mapResponseToComment(response)),
      tap((comment) => {
        this.store.dispatch(new AddComment(comment));
        this.store.dispatch(new ClearCommentForm());
      }),
    );
  }

  deleteComment(commentId: string, slug: string): Observable<void> {
    return this.commentsApi.delete(commentId, slug).pipe(
      this.spinnerFacade.withSpinner(),
      tap(() => {
        this.store.dispatch(new RemoveComment(commentId));
      }),
    );
  }

  clearComments(): void {
    this.store.dispatch(new ClearComments());
  }

  clearCommentForm(): void {
    this.store.dispatch(new ClearCommentForm());
  }
}
