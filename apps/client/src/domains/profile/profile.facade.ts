import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { SpinnerFacade } from '$modules/spinner';
import { ProfileApi } from './api';
import { Profile } from './model';
import { ClearProfile, ProfileState, SetProfile } from './store';

@Injectable()
export class ProfileFacade {
  private readonly store = inject(Store);
  private readonly api = inject(ProfileApi);
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly profile$ = this.store.select(ProfileState.getProfile);

  loadProfile(username: string): void {
    this.api
      .get(username)
      .pipe(this.spinnerFacade.withSpinner())
      .subscribe((profile) => {
        this.store.dispatch(new SetProfile(profile));
      });
  }

  follow(username: string): Observable<Profile> {
    return this.api.follow(username).pipe(
      tap((profile) => {
        this.store.dispatch(new SetProfile(profile));
      }),
    );
  }

  unfollow(username: string): Observable<Profile> {
    return this.api.unfollow(username).pipe(
      tap((profile) => {
        this.store.dispatch(new SetProfile(profile));
      }),
    );
  }

  clearProfile(): void {
    this.store.dispatch(new ClearProfile());
  }
}
