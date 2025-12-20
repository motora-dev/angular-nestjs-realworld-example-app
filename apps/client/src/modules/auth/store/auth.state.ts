import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { SetAuthenticated } from './auth.actions';

export interface AuthStateModel {
  isAuthenticated: boolean;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    isAuthenticated: false,
  },
})
@Injectable()
export class AuthState {
  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.isAuthenticated;
  }

  @Action(SetAuthenticated)
  setAuthenticated(ctx: StateContext<AuthStateModel>, action: SetAuthenticated) {
    ctx.patchState({ isAuthenticated: action.isAuthenticated });
  }
}
