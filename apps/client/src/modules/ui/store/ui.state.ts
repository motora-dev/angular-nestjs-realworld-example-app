import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { CloseSidebar, OpenSidebar, ToggleSidebar } from './ui.actions';

export interface UiStateModel {
  isSidebarOpen: boolean;
}

@State<UiStateModel>({
  name: 'ui',
  defaults: {
    isSidebarOpen: false,
  },
})
@Injectable()
export class UiState {
  @Selector()
  static isSidebarOpen(state: UiStateModel): boolean {
    return state.isSidebarOpen;
  }

  @Action(OpenSidebar)
  openSidebar(ctx: StateContext<UiStateModel>) {
    ctx.patchState({ isSidebarOpen: true });
  }

  @Action(CloseSidebar)
  closeSidebar(ctx: StateContext<UiStateModel>) {
    ctx.patchState({ isSidebarOpen: false });
  }

  @Action(ToggleSidebar)
  toggleSidebar(ctx: StateContext<UiStateModel>) {
    const state = ctx.getState();
    ctx.patchState({ isSidebarOpen: !state.isSidebarOpen });
  }
}
