import { Routes } from '@angular/router';
import { provideStates } from '@ngxs/store';

import { ArticleListState } from '$domains/article-list/store';
import { UiState } from '$modules/ui/store';

export const ARTICLE_LIST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./article-list').then((m) => m.ArticleListComponent),
    providers: [provideStates([ArticleListState, UiState])],
    data: { revalidate: 60 }, // ISR: キャッシュを60秒ごとに再検証
  },
];
