import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { SettingsFormState } from '../model';
import { ClearSettingsForm, SetSettingsForm } from './settings.actions';

const defaultSettingsForm: SettingsFormState = {
  model: {
    image: '',
    username: '',
    bio: '',
    email: '',
  },
  dirty: false,
  status: '',
  errors: {},
};

export interface SettingsStateModel {
  settingsForm: SettingsFormState;
}

@State<SettingsStateModel>({
  name: 'settings',
  defaults: {
    settingsForm: defaultSettingsForm,
  },
})
@Injectable()
export class SettingsState {
  @Action(SetSettingsForm)
  setSettingsForm(ctx: StateContext<SettingsStateModel>, action: SetSettingsForm) {
    ctx.setState(
      patch({
        settingsForm: patch({
          model: patch({
            image: action.form.image,
            username: action.form.username,
            bio: action.form.bio,
            email: action.form.email,
          }),
          dirty: false,
        }),
      }),
    );
  }

  @Action(ClearSettingsForm)
  clearSettingsForm(ctx: StateContext<SettingsStateModel>) {
    ctx.setState(patch({ settingsForm: defaultSettingsForm }));
  }
}
