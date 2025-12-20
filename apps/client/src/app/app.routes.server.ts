import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server,
  },
  {
    path: 'article/:articleId/:pageId/edit',
    renderMode: RenderMode.Client,
  },
  {
    path: 'article/:articleId/edit',
    renderMode: RenderMode.Client,
  },
  {
    path: 'article/:articleId/:pageId',
    renderMode: RenderMode.Server,
  },
  {
    path: 'article/:articleId',
    renderMode: RenderMode.Server,
  },
  {
    path: 'privacy-policy',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: 'auth',
    renderMode: RenderMode.Client,
  },
  {
    path: 'error',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
