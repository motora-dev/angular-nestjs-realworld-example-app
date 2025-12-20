import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./article-list/article-list.routes').then((m) => m.ARTICLE_LIST_ROUTES),
  },
  {
    path: 'article/:articleId/:pageId/edit',
    loadChildren: () => import('./article-page-edit/article-page-edit.routes').then((m) => m.ARTICLE_PAGE_EDIT_ROUTES),
  },
  {
    path: 'article/:articleId/edit',
    loadChildren: () => import('./article-edit/article-edit.routes').then((m) => m.ARTICLE_EDIT_ROUTES),
  },
  {
    path: 'article/:articleId/:pageId',
    loadChildren: () => import('./article-page/article-page.routes').then((m) => m.ARTICLE_PAGE_ROUTES),
  },
  {
    path: 'article/:articleId',
    loadChildren: () => import('./article/article.routes').then((m) => m.ARTICLE_ROUTES),
  },
  {
    path: 'privacy-policy',
    loadChildren: () => import('./privacy-policy/privacy-policy.routes').then((m) => m.PRIVACY_POLICY_ROUTES),
  },
  {
    path: 'login',
    loadChildren: () => import('./auth/login/login.routes').then((m) => m.LOGIN_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/callback/callback.routes').then((m) => m.CALLBACK_ROUTES),
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
