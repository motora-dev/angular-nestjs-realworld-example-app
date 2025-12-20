import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { SpinnerFacade } from '$modules/spinner';
import { ArticleListApi } from './api';
import { Article } from './model';
import { ArticleListState, SetArticleList } from './store';

@Injectable()
export class ArticleListFacade {
  private readonly store = inject(Store);
  private readonly api = inject(ArticleListApi);
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly articleList$ = this.store.select(ArticleListState.getArticleList);

  loadArticleList(): void {
    this.api
      .getArticleList()
      .pipe(this.spinnerFacade.withSpinner())
      .subscribe((response) => {
        const articles: Article[] = response.articleList.map((r) => ({
          id: r.id,
          title: r.title,
          tags: r.tags,
          createdAt: new Date(r.createdAt),
        }));
        this.store.dispatch(new SetArticleList(articles));
      });
  }
}
