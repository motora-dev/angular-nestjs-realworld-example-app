import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { SetCurrentUser } from '$modules/auth/store';
import { SpinnerFacade } from '$modules/spinner';
import { SettingsApi } from './api';
import { SettingsFormModel } from './model';
import { ClearSettingsForm, SetSettingsForm, SettingsState } from './store';

@Injectable({ providedIn: 'root' })
export class SettingsFacade {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly store = inject(Store);
  private readonly api = inject(SettingsApi);
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly isFormInvalid$ = this.store.select(SettingsState.isFormInvalid);
  readonly isFormDirty$ = this.store.select(SettingsState.isFormDirty);
  readonly formValue$ = this.store.select(SettingsState.getFormValue);

  loadSettingsForm(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.api.getCurrentUser().subscribe((user) => {
      this.store.dispatch(new SetSettingsForm(user));
      this.store.dispatch(
        new SetCurrentUser({
          image: user.image,
          username: user.username,
          bio: user.bio,
          email: user.email,
        }),
      );
    });
  }

  updateUser(userData: Partial<SettingsFormModel>): Observable<SettingsFormModel> {
    return this.api.updateUser(userData).pipe(
      this.spinnerFacade.withSpinner(),
      tap((user) => {
        this.store.dispatch(
          new SetCurrentUser({
            image: user.image,
            username: user.username,
            bio: user.bio,
            email: user.email,
          }),
        );
      }),
    );
  }

  clearSettingsForm(): void {
    this.store.dispatch(new ClearSettingsForm());
  }
}
