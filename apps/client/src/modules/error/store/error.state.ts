import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { AppError } from '../error.model';
import { ClearError, ShowError } from './error.actions';

export interface ErrorStateModel {
  error: AppError | null;
}

@State<ErrorStateModel>({
  name: 'error',
  defaults: {
    error: null,
  },
})
@Injectable()
export class ErrorState {
  @Selector()
  static error(state: ErrorStateModel): AppError | null {
    return state.error;
  }

  @Action(ShowError)
  showError(ctx: StateContext<ErrorStateModel>, action: ShowError) {
    ctx.patchState({ error: action.error });
  }

  @Action(ClearError)
  clearError(ctx: StateContext<ErrorStateModel>) {
    ctx.patchState({ error: null });
  }
}
