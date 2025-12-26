import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'article/:slug',
    loadChildren: () => import('./article/article.routes').then((m) => m.ARTICLE_ROUTES),
  },
  {
    path: 'editor',
    loadChildren: () => import('./editor/editor.routes').then((m) => m.EDITOR_ROUTES),
  },
  {
    path: 'editor/:slug',
    loadChildren: () => import('./editor/editor.routes').then((m) => m.EDITOR_ROUTES),
  },
  {
    path: 'profile/:username',
    loadChildren: () => import('./profile/profile.routes').then((m) => m.PROFILE_ROUTES),
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
  },
  {
    path: 'login',
    loadChildren: () => import('./auth-login/auth-login.routes').then((m) => m.AUTH_LOGIN_ROUTES),
  },
  {
    path: 'register',
    loadChildren: () => import('./auth-register/auth-register.routes').then((m) => m.AUTH_REGISTER_ROUTES),
  },
  {
    path: 'error',
    loadChildren: () => import('./error/error.routes').then((m) => m.ERROR_ROUTES),
  },
  {
    path: '**',
    loadComponent: () => import('./error/not-found/not-found').then((m) => m.NotFoundComponent),
  },
];
