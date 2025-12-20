import { Routes } from '@angular/router';

export const ARTICLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./article').then((m) => m.ArticleComponent),
  },
];
