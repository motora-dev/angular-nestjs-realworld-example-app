import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { Article } from '../model';
import { SetArticleList } from './article-list.actions';

export interface ArticleListStateModel {
  articleList: Article[];
}

@State<ArticleListStateModel>({
  name: 'articleList',
  defaults: {
    articleList: [],
  },
})
@Injectable()
export class ArticleListState {
  @Selector()
  static getArticleList(state: ArticleListStateModel): Article[] {
    return state.articleList;
  }

  @Action(SetArticleList)
  setArticleList(ctx: StateContext<ArticleListStateModel>, action: SetArticleList) {
    ctx.patchState({ articleList: action.articleList });
  }
}
