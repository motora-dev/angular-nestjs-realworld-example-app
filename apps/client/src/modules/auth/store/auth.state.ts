import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { User } from '../model';
import { ClearPendingRegistration, SetAuthenticated, SetCurrentUser, SetPendingRegistration } from './auth.actions';

export interface AuthStateModel {
  isAuthenticated: boolean;
  currentUser: User | null;
  pendingRegistrationEmail: string | null;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    isAuthenticated: false,
    currentUser: null,
    pendingRegistrationEmail: null,
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

  @Selector()
  static pendingRegistrationEmail(state: AuthStateModel): string | null {
    return state.pendingRegistrationEmail;
  }

  @Action(SetAuthenticated)
  setAuthenticated(ctx: StateContext<AuthStateModel>, action: SetAuthenticated) {
    ctx.patchState({ isAuthenticated: action.isAuthenticated });
  }

  @Action(SetCurrentUser)
  setCurrentUser(ctx: StateContext<AuthStateModel>, action: SetCurrentUser) {
    ctx.patchState({ currentUser: action.user });
  }

  @Action(SetPendingRegistration)
  setPendingRegistration(ctx: StateContext<AuthStateModel>, action: SetPendingRegistration) {
    ctx.patchState({ pendingRegistrationEmail: action.email });
  }

  @Action(ClearPendingRegistration)
  clearPendingRegistration(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ pendingRegistrationEmail: null });
  }
}
