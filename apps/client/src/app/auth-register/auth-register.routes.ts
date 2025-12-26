import { Routes } from '@angular/router';
import { provideStates } from '@ngxs/store';

import { AuthRegisterState } from '$domains/auth-register/store';

export const AUTH_REGISTER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth-register').then((m) => m.AuthRegisterComponent),
    providers: [provideStates([AuthRegisterState])],
  },
];
