import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { Article } from '../model';
import { ClearArticle, SetArticle } from './article.actions';

export interface ArticleStateModel {
  article: Article | null;
}

@State<ArticleStateModel>({
  name: 'article',
  defaults: {
    article: null,
  },
})
@Injectable()
export class ArticleState {
  @Selector()
  static getArticle(state: ArticleStateModel): Article | null {
    return state.article;
  }

  @Action(SetArticle)
  setArticle(ctx: StateContext<ArticleStateModel>, action: SetArticle) {
    ctx.patchState({ article: action.article });
  }

  @Action(ClearArticle)
  clearArticle(ctx: StateContext<ArticleStateModel>) {
    ctx.patchState({ article: null });
  }
}
