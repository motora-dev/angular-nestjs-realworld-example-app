import { Routes } from '@angular/router';

export const ERROR_ROUTES: Routes = [
  {
    path: '401',
    loadComponent: () => import('./unauthorized/unauthorized').then((m) => m.UnauthorizedComponent),
  },
  {
    path: '403',
    loadComponent: () => import('./forbidden/forbidden').then((m) => m.ForbiddenComponent),
  },
  {
    path: '404',
    loadComponent: () => import('./not-found/not-found').then((m) => m.NotFoundComponent),
  },
];
