import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { HideSpinner, ShowSpinner } from './spinner.actions';

export interface SpinnerStateModel {
  loadingCount: number;
  message: string | null;
}

@State<SpinnerStateModel>({
  name: 'spinner',
  defaults: {
    loadingCount: 0,
    message: null,
  },
})
@Injectable()
export class SpinnerState {
  @Selector()
  static isLoading(state: SpinnerStateModel): boolean {
    return state.loadingCount > 0;
  }

  @Selector()
  static getMessage(state: SpinnerStateModel): string | null {
    return state.message;
  }

  @Action(ShowSpinner)
  showSpinner(ctx: StateContext<SpinnerStateModel>, action: ShowSpinner) {
    const state = ctx.getState();
    ctx.patchState({
      loadingCount: state.loadingCount + 1,
      message: action.message ?? state.message, // メッセージが指定されていない場合は既存のメッセージを保持
    });
  }

  @Action(HideSpinner)
  hideSpinner(ctx: StateContext<SpinnerStateModel>) {
    const count = ctx.getState().loadingCount;
    const newCount = Math.max(0, count - 1);
    ctx.patchState({
      loadingCount: newCount,
      message: newCount === 0 ? null : ctx.getState().message, // カウントが0になったらメッセージをクリア
    });
  }
}
