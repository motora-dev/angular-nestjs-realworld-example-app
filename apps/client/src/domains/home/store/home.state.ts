import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { Article, ArticleListConfig } from '$domains/article';
import { SetArticles, SetListConfig, SetTags } from './home.actions';

export interface HomeStateModel {
  tags: string[];
  articles: Article[];
  articlesCount: number;
  listConfig: ArticleListConfig;
}

@State<HomeStateModel>({
  name: 'home',
  defaults: {
    tags: [],
    articles: [],
    articlesCount: 0,
    listConfig: {
      type: 'all',
      filters: {},
    },
  },
})
@Injectable()
export class HomeState {
  @Selector()
  static getTags(state: HomeStateModel): string[] {
    return state.tags;
  }

  @Selector()
  static getArticles(state: HomeStateModel): Article[] {
    return state.articles;
  }

  @Selector()
  static getArticlesCount(state: HomeStateModel): number {
    return state.articlesCount;
  }

  @Selector()
  static getListConfig(state: HomeStateModel): ArticleListConfig {
    return state.listConfig;
  }

  @Action(SetTags)
  setTags(ctx: StateContext<HomeStateModel>, action: SetTags) {
    ctx.patchState({ tags: action.tags });
  }

  @Action(SetArticles)
  setArticles(ctx: StateContext<HomeStateModel>, action: SetArticles) {
    ctx.patchState({
      articles: action.articles,
      articlesCount: action.articlesCount,
    });
  }

  @Action(SetListConfig)
  setListConfig(ctx: StateContext<HomeStateModel>, action: SetListConfig) {
    ctx.patchState({ listConfig: action.config });
  }
}
