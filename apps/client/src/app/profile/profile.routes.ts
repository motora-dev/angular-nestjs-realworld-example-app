import { Routes } from '@angular/router';
import { provideStates } from '@ngxs/store';

import { ProfileState } from '$domains/profile/store';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./profile').then((m) => m.ProfileComponent),
    providers: [provideStates([ProfileState])],
  },
];
