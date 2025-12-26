import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { EditorFormModel, EditorFormState } from '../model';
import { ClearEditorForm, SetEditorForm } from './editor.actions';

const defaultEditorForm: EditorFormState = {
  model: {
    title: '',
    description: '',
    body: '',
  },
  dirty: false,
  status: '',
  errors: {},
};

export interface EditorStateModel {
  editorForm: EditorFormState;
}

@State<EditorStateModel>({
  name: 'editor',
  defaults: {
    editorForm: defaultEditorForm,
  },
})
@Injectable()
export class EditorState {
  @Selector()
  static isFormInvalid(state: EditorStateModel): boolean {
    return state.editorForm.status !== 'VALID';
  }

  @Selector()
  static isFormDirty(state: EditorStateModel): boolean {
    return state.editorForm.dirty;
  }

  @Selector()
  static getFormValue(state: EditorStateModel): EditorFormModel | null {
    return state.editorForm?.model ?? null;
  }

  @Action(SetEditorForm)
  setEditorForm(ctx: StateContext<EditorStateModel>, action: SetEditorForm) {
    ctx.setState(
      patch({
        editorForm: patch({
          model: patch({
            title: action.form.title,
            description: action.form.description,
            body: action.form.body,
          }),
          dirty: false,
        }),
      }),
    );
  }

  @Action(ClearEditorForm)
  clearEditorForm(ctx: StateContext<EditorStateModel>) {
    ctx.setState(patch({ editorForm: defaultEditorForm }));
  }
}
