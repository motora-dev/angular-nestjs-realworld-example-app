import { Routes } from '@angular/router';
import { provideStates } from '@ngxs/store';

import { ArticleEditState } from '$domains/article-edit/store';

export const ARTICLE_EDIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./article-edit').then((m) => m.ArticleEditComponent),
    providers: [provideStates([ArticleEditState])],
  },
];
