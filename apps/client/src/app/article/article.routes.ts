import { Routes } from '@angular/router';
import { provideStates } from '@ngxs/store';

import { ArticleState, CommentsState } from '$domains/article/store';

export const ARTICLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./article').then((m) => m.ArticleComponent),
    providers: [provideStates([ArticleState, CommentsState])],
  },
];
