import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { User } from '../model';
import { SetAuthenticated, SetCurrentUser } from './auth.actions';

export interface AuthStateModel {
  isAuthenticated: boolean;
  currentUser: User | null;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    isAuthenticated: false,
    currentUser: null,
  },
})
@Injectable()
export class AuthState {
  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.isAuthenticated;
  }

  @Selector()
  static currentUser(state: AuthStateModel): User | null {
    return state.currentUser;
  }

  @Action(SetAuthenticated)
  setAuthenticated(ctx: StateContext<AuthStateModel>, action: SetAuthenticated) {
    ctx.setState(patch({ isAuthenticated: action.isAuthenticated }));
  }

  @Action(SetCurrentUser)
  setCurrentUser(ctx: StateContext<AuthStateModel>, action: SetCurrentUser) {
    ctx.setState(patch({ currentUser: action.user }));
  }
}
