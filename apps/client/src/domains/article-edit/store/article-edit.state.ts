import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { SetArticle, SetPages } from './article-edit.actions';
import { ArticleEditPageItem, EditFormState, FormModel, RootFormState } from '../model';

export interface ArticleEditStateModel {
  pages: ArticleEditPageItem[];
  rootForm: RootFormState;
  editForm: EditFormState;
}

@State<ArticleEditStateModel>({
  name: 'articleEdit',
  defaults: {
    pages: [],
    rootForm: {
      model: {
        articleId: '',
      },
      dirty: false,
      status: '',
      errors: {},
    },
    editForm: {
      model: {
        title: '',
        description: '',
        tags: [],
      },
      dirty: false,
      status: '',
      errors: {},
    },
  },
})
@Injectable()
export class ArticleEditState {
  @Selector()
  static isFormInvalid(state: ArticleEditStateModel): boolean {
    return state.rootForm.status !== 'VALID' || state.editForm.status !== 'VALID';
  }

  @Selector()
  static isFormDirty(state: ArticleEditStateModel): boolean {
    return state.rootForm.dirty || state.editForm.dirty;
  }

  @Selector()
  static getPages(state: ArticleEditStateModel): ArticleEditPageItem[] {
    return state.pages;
  }

  @Selector()
  static getFormValue(state: ArticleEditStateModel): FormModel | null {
    const rootForm = state.rootForm?.model;
    const editForm = state.editForm?.model;

    if (!rootForm || !editForm) {
      return null;
    }

    return {
      ...rootForm,
      ...editForm,
    };
  }

  @Action(SetArticle)
  setArticle(ctx: StateContext<ArticleEditStateModel>, action: SetArticle) {
    ctx.setState(
      patch({
        rootForm: patch({
          model: patch({
            articleId: action.article.articleId,
          }),
          dirty: false,
        }),
        editForm: patch({
          model: patch({
            title: action.article.title,
            description: action.article.description,
            tags: action.article.tags,
          }),
          dirty: false,
        }),
      }),
    );
  }

  @Action(SetPages)
  setPages(ctx: StateContext<ArticleEditStateModel>, action: SetPages) {
    ctx.setState(
      patch({
        pages: action.pages,
      }),
    );
  }
}
