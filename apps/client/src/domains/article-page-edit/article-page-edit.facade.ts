import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { map, Observable, switchMap, tap } from 'rxjs';

import { IsrService } from '$modules/isr';
import { SpinnerFacade } from '$modules/spinner';
import { ArticlePageEditApi } from './api';
import { UpdatePageRequest, UpdatePageResponse } from './api/article-page-edit.response';
import { FormModel, PageItem } from './model';
import { ArticlePageEditState, SetPage, SetPages } from './store';

@Injectable()
export class ArticlePageEditFacade {
  private readonly store = inject(Store);
  private readonly api = inject(ArticlePageEditApi);
  private readonly spinnerFacade = inject(SpinnerFacade);
  private readonly isrService = inject(IsrService);

  readonly isFormInvalid$ = this.store.select(ArticlePageEditState.isFormInvalid);
  readonly isFormDirty$ = this.store.select(ArticlePageEditState.isFormDirty);
  readonly formValue$ = this.store.select(ArticlePageEditState.getFormValue);

  readonly pageId$ = this.store.select(ArticlePageEditState.getPageId);
  readonly pages$ = this.store.select(ArticlePageEditState.getPages);
  readonly content$ = this.store.select(ArticlePageEditState.getContent);

  loadPages(articleId: string): void {
    this.api
      .getPages(articleId)
      .pipe(this.spinnerFacade.withSpinner())
      .subscribe((response) => {
        const pages: PageItem[] = response.pages.map((p) => ({
          articleId: articleId,
          pageId: p.id,
          title: p.title,
          level: p.level,
          order: p.order,
        }));
        this.store.dispatch(new SetPages(pages));
      });
  }

  loadPage(articleId: string, pageId: string): void {
    this.api
      .getPage(articleId, pageId)
      .pipe(this.spinnerFacade.withSpinner())
      .subscribe((response) => {
        const page: FormModel = {
          articleId: articleId,
          pageId: response.id,
          title: response.title,
          description: response.description,
          content: response.content,
        };
        this.store.dispatch(new SetPage(page));
      });
  }

  updatePage(articleId: string, pageId: string, request: UpdatePageRequest): Observable<UpdatePageResponse> {
    return this.api.updatePage(articleId, pageId, request).pipe(
      this.spinnerFacade.withSpinner(),
      tap((response) => {
        const page: FormModel = {
          articleId: articleId,
          pageId: response.id,
          title: response.title,
          description: response.description,
          content: response.content,
        };
        this.store.dispatch(new SetPage(page));
      }),
      // Invalidate ISR cache for the updated page
      switchMap((response) => this.isrService.invalidateArticlePage(articleId, pageId).pipe(map(() => response))),
    );
  }

  clearPages(): void {
    this.store.dispatch(new SetPages([]));
    this.store.dispatch(new SetPage(null));
  }
}
