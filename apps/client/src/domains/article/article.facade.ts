import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { SpinnerFacade } from '$modules/spinner';
import { ArticleApi, ArticleResponse } from './api';
import { Article } from './model';
import { ArticleState, ClearArticle, SetArticle } from './store';

@Injectable()
export class ArticleFacade {
  private readonly store = inject(Store);
  private readonly api = inject(ArticleApi);
  private readonly router = inject(Router);
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly article$ = this.store.select(ArticleState.getArticle);

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
    this.api
      .get(slug)
      .pipe(this.spinnerFacade.withSpinner())
      .subscribe((response) => {
        const article = this.mapResponseToArticle(response);
        this.store.dispatch(new SetArticle(article));
      });
  }

  createArticle(article: Partial<Article>): Observable<Article> {
    return this.api.create(article).pipe(
      this.spinnerFacade.withSpinner(),
      map((response) => this.mapResponseToArticle(response)),
      tap((created) => {
        this.store.dispatch(new SetArticle(created));
      }),
    );
  }

  updateArticle(article: Partial<Article>): Observable<Article> {
    return this.api.update(article).pipe(
      this.spinnerFacade.withSpinner(),
      map((response) => this.mapResponseToArticle(response)),
      tap((updated) => {
        this.store.dispatch(new SetArticle(updated));
      }),
    );
  }

  deleteArticle(slug: string): Observable<void> {
    return this.api.delete(slug).pipe(
      this.spinnerFacade.withSpinner(),
      tap(() => {
        this.store.dispatch(new ClearArticle());
        this.router.navigate(['/']);
      }),
    );
  }

  favoriteArticle(slug: string): Observable<Article> {
    return this.api.favorite(slug).pipe(
      map((response) => this.mapResponseToArticle(response)),
      tap((article) => {
        this.store.dispatch(new SetArticle(article));
      }),
    );
  }

  unfavoriteArticle(slug: string): Observable<void> {
    return this.api.unfavorite(slug);
  }

  clearArticle(): void {
    this.store.dispatch(new ClearArticle());
  }
}
