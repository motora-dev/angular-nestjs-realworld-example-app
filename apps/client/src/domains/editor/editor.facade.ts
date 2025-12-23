import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SpinnerFacade } from '$modules/spinner';
import { ArticleResponse, EditorApi } from './api';
import { EditorArticle } from './model';
import { ClearEditorForm, EditorState, SetEditorForm } from './store';

@Injectable({ providedIn: 'root' })
export class EditorFacade {
  private readonly store = inject(Store);
  private readonly api = inject(EditorApi);
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly isFormInvalid$ = this.store.select(EditorState.isFormInvalid);
  readonly isFormDirty$ = this.store.select(EditorState.isFormDirty);
  readonly formValue$ = this.store.select(EditorState.getFormValue);

  private mapResponseToArticle(response: ArticleResponse): EditorArticle {
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

  loadArticle(slug: string): Observable<EditorArticle> {
    return this.api.get(slug).pipe(
      this.spinnerFacade.withSpinner(),
      map((response) => {
        const article = this.mapResponseToArticle(response);
        this.store.dispatch(
          new SetEditorForm({
            title: article.title,
            description: article.description,
            body: article.body,
          }),
        );
        return article;
      }),
    );
  }

  createArticle(article: Partial<EditorArticle>): Observable<EditorArticle> {
    return this.api.create(article).pipe(
      this.spinnerFacade.withSpinner(),
      map((response) => this.mapResponseToArticle(response)),
    );
  }

  updateArticle(article: Partial<EditorArticle>): Observable<EditorArticle> {
    return this.api.update(article).pipe(
      this.spinnerFacade.withSpinner(),
      map((response) => this.mapResponseToArticle(response)),
    );
  }

  clearEditorForm(): void {
    this.store.dispatch(new ClearEditorForm());
  }
}
