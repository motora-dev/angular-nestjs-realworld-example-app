import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { ClearPendingRegistration, SetPendingRegistration } from './auth-register.actions';

export interface AuthRegisterStateModel {
  pendingRegistrationEmail: string | null;
}

@State<AuthRegisterStateModel>({
  name: 'authRegister',
  defaults: {
    pendingRegistrationEmail: null,
  },
})
@Injectable()
export class AuthRegisterState {
  @Selector()
  static pendingRegistrationEmail(state: AuthRegisterStateModel): string | null {
    return state.pendingRegistrationEmail;
  }

  @Action(SetPendingRegistration)
  setPendingRegistration(ctx: StateContext<AuthRegisterStateModel>, action: SetPendingRegistration) {
    ctx.setState(patch({ pendingRegistrationEmail: action.email }));
  }

  @Action(ClearPendingRegistration)
  clearPendingRegistration(ctx: StateContext<AuthRegisterStateModel>) {
    ctx.setState(patch({ pendingRegistrationEmail: null }));
  }
}
