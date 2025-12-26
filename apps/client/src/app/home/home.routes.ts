import { Routes } from '@angular/router';
import { provideStates } from '@ngxs/store';

import { HomeState } from '$domains/home/store';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./home').then((m) => m.HomeComponent),
    providers: [provideStates([HomeState])],
  },
];
