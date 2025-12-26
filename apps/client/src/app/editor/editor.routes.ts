import { Routes } from '@angular/router';
import { provideStates } from '@ngxs/store';

import { EditorState } from '$domains/editor/store';

export const EDITOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./editor').then((m) => m.EditorComponent),
    providers: [provideStates([EditorState])],
  },
];
