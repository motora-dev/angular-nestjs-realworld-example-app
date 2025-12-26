import { Routes } from '@angular/router';
import { provideStates } from '@ngxs/store';

import { SettingsState } from '$domains/settings/store';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings').then((m) => m.SettingsComponent),
    providers: [provideStates([SettingsState])],
  },
];
