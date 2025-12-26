import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { HideSnackbar, ShowSnackbar } from './snackbar.actions';

export interface SnackbarItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
  createdAt: number;
}

export interface SnackbarStateModel {
  items: SnackbarItem[];
}

@State<SnackbarStateModel>({
  name: 'snackbar',
  defaults: {
    items: [],
  },
})
@Injectable()
export class SnackbarState {
  @Selector()
  static getSnackbars(state: SnackbarStateModel): SnackbarItem[] {
    return state.items;
  }

  @Action(ShowSnackbar)
  showSnackbar(ctx: StateContext<SnackbarStateModel>, action: ShowSnackbar) {
    const state = ctx.getState();
    const id = action.id || this.generateId();
    const newItem: SnackbarItem = {
      id,
      message: action.message,
      type: action.type,
      duration: action.duration,
      createdAt: Date.now(),
    };

    ctx.patchState({
      items: [...state.items, newItem],
    });
  }

  @Action(HideSnackbar)
  hideSnackbar(ctx: StateContext<SnackbarStateModel>, action: HideSnackbar) {
    const state = ctx.getState();
    ctx.patchState({
      items: state.items.filter((item) => item.id !== action.id),
    });
  }

  private generateId(): string {
    return `snackbar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
