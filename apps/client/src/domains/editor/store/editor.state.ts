import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { EditorFormState } from '../model';
import { ClearEditorForm, SetEditorForm } from './editor.actions';

const defaultEditorForm: EditorFormState = {
  model: {
    title: '',
    description: '',
    body: '',
    tagList: [],
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
  @Action(SetEditorForm)
  setEditorForm(ctx: StateContext<EditorStateModel>, action: SetEditorForm) {
    ctx.setState(
      patch({
        editorForm: patch({
          model: patch({
            title: action.form.title,
            description: action.form.description,
            body: action.form.body,
            tagList: action.form.tagList,
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
