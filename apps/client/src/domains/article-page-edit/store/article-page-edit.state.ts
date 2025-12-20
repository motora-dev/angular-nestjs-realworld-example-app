import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { EditFormState, FormModel, PageItem, RootFormState } from '../model';
import { SetPage, SetPages } from './article-page-edit.actions';

export interface ArticlePageEditStateModel {
  pages: PageItem[];
  rootForm: RootFormState;
  editForm: EditFormState;
}

@State<ArticlePageEditStateModel>({
  name: 'articlePageEdit',
  defaults: {
    pages: [],
    rootForm: {
      model: {
        articleId: '',
        pageId: '',
        title: '',
        description: '',
      },
      dirty: false,
      status: '',
      errors: {},
    },
    editForm: {
      model: {
        content: '',
      },
      dirty: false,
      status: '',
      errors: {},
    },
  },
})
@Injectable()
export class ArticlePageEditState {
  @Selector()
  static isFormInvalid(state: ArticlePageEditStateModel): boolean {
    return state.rootForm.status !== 'VALID' || state.editForm.status !== 'VALID';
  }

  @Selector()
  static isFormDirty(state: ArticlePageEditStateModel): boolean {
    return state.rootForm.dirty || state.editForm.dirty;
  }

  @Selector()
  static getFormValue(state: ArticlePageEditStateModel): FormModel | null {
    const pageForm = state.rootForm?.model;
    const editForm = state.editForm?.model;

    if (!pageForm || !editForm) {
      return null;
    }

    return {
      ...pageForm,
      ...editForm,
    };
  }

  @Selector()
  static getPageId(state: ArticlePageEditStateModel): string {
    return state.rootForm.model.pageId;
  }

  @Selector()
  static getPages(state: ArticlePageEditStateModel): PageItem[] {
    return state.pages;
  }

  @Selector()
  static getContent(state: ArticlePageEditStateModel): string {
    return state.editForm?.model?.content ?? '';
  }

  @Action(SetPages)
  setPages(ctx: StateContext<ArticlePageEditStateModel>, action: SetPages) {
    ctx.patchState({ pages: action.pages });
  }

  @Action(SetPage)
  setCurrentPage(ctx: StateContext<ArticlePageEditStateModel>, action: SetPage) {
    ctx.setState(
      patch({
        rootForm: patch({
          model: patch({
            articleId: action.page?.articleId || '',
            pageId: action.page?.pageId || '',
            title: action.page?.title || '',
            description: action.page?.description || '',
          }),
          dirty: false,
        }),
        editForm: patch({
          model: patch({
            content: action.page?.content || '',
          }),
          dirty: false,
        }),
      }),
    );
  }
}
