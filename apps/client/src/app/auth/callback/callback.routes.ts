import { Routes } from '@angular/router';

export const CALLBACK_ROUTES: Routes = [
  {
    path: 'callback',
    loadComponent: () => import('./callback').then((m) => m.CallbackComponent),
  },
];
