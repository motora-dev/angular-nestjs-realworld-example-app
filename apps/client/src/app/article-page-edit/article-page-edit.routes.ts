import { Routes } from '@angular/router';
import { provideStates } from '@ngxs/store';

import { ArticlePageEditState } from '$domains/article-page-edit/store';

export const ARTICLE_PAGE_EDIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./article-page-edit').then((m) => m.ArticlePageEditComponent),
    providers: [provideStates([ArticlePageEditState])],
  },
];
