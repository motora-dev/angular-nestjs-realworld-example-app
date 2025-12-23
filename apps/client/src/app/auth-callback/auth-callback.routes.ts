import { Routes } from '@angular/router';

export const AUTH_CALLBACK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth-callback').then((m) => m.AuthCallbackComponent),
  },
];
