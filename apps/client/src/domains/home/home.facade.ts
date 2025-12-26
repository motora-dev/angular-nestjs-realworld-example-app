import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { Article, ArticleListConfig } from '$domains/article';
import { SpinnerFacade } from '$modules/spinner';
import { HomeApi } from './api';
import { HomeState, SetArticles, SetListConfig, SetTags } from './store';

@Injectable()
export class HomeFacade {
  private readonly store = inject(Store);
  private readonly api = inject(HomeApi);
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly tags$ = this.store.select(HomeState.getTags);
  readonly articles$ = this.store.select(HomeState.getArticles);
  readonly articlesCount$ = this.store.select(HomeState.getArticlesCount);
  readonly listConfig$ = this.store.select(HomeState.getListConfig);

  loadTags(): void {
    this.api.getTags().subscribe((response) => {
      this.store.dispatch(new SetTags(response.tags));
    });
  }

  loadArticles(config: ArticleListConfig): void {
    this.store.dispatch(new SetListConfig(config));

    this.api
      .getArticles(config)
      .pipe(this.spinnerFacade.withSpinner())
      .subscribe((response) => {
        const articles: Article[] = response.articles.map((r) => ({
          slug: r.slug,
          title: r.title,
          description: r.description,
          body: r.body,
          tagList: r.tagList,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
          favorited: r.favorited,
          favoritesCount: r.favoritesCount,
          author: r.author,
        }));
        this.store.dispatch(new SetArticles(articles, response.articlesCount));
      });
  }

  setListConfig(config: ArticleListConfig): void {
    this.loadArticles(config);
  }
}
