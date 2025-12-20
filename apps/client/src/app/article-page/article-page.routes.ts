import { Routes } from '@angular/router';
import { provideStates } from '@ngxs/store';

import { ArticlePageState } from '$domains/article-page/store';
import { UiState } from '$modules/ui/store';

export const ARTICLE_PAGE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./article-page').then((m) => m.ArticlePageComponent),
    providers: [provideStates([ArticlePageState, UiState])],
    data: { revalidate: 300 },
  },
];
