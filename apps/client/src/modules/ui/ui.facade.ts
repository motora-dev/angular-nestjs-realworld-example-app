import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { CloseSidebar, OpenSidebar, ToggleSidebar, UiState } from './store';

@Injectable({ providedIn: 'root' })
export class UiFacade {
  private readonly store = inject(Store);

  readonly isSidebarOpen$ = this.store.select(UiState.isSidebarOpen);

  openSidebar(): void {
    this.store.dispatch(new OpenSidebar());
  }

  closeSidebar(): void {
    this.store.dispatch(new CloseSidebar());
  }

  toggleSidebar(): void {
    this.store.dispatch(new ToggleSidebar());
  }
}
