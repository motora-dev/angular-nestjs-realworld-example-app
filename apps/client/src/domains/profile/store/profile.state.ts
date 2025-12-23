import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { Profile } from '../model';
import { ClearProfile, SetProfile } from './profile.actions';

export interface ProfileStateModel {
  profile: Profile | null;
}

@State<ProfileStateModel>({
  name: 'profile',
  defaults: {
    profile: null,
  },
})
@Injectable()
export class ProfileState {
  @Selector()
  static getProfile(state: ProfileStateModel): Profile | null {
    return state.profile;
  }

  @Action(SetProfile)
  setProfile(ctx: StateContext<ProfileStateModel>, action: SetProfile) {
    ctx.patchState({ profile: action.profile });
  }

  @Action(ClearProfile)
  clearProfile(ctx: StateContext<ProfileStateModel>) {
    ctx.patchState({ profile: null });
  }
}
