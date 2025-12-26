import { Routes } from '@angular/router';

export const AUTH_LOGIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth-login').then((m) => m.AuthLoginComponent),
  },
];
