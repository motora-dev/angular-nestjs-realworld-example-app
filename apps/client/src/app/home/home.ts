import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';

import { ArticleListConfig } from '$domains/article';
import { HomeFacade } from '$domains/home';
import { AuthFacade } from '$modules/auth';
import { SeoService } from '$modules/seo';
import { ArticleListComponent } from './components/article-list/article-list';
import { TagListComponent } from './components/tag-list/tag-list';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe, ArticleListComponent, TagListComponent],
  providers: [HomeFacade],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly facade = inject(HomeFacade);
  private readonly authFacade = inject(AuthFacade);
  private readonly seoService = inject(SeoService);

  readonly tags$ = this.facade.tags$;
  readonly articles$ = this.facade.articles$;
  readonly listConfig$ = this.facade.listConfig$;
  readonly isAuthenticated$ = this.authFacade.isAuthenticated$;

  readonly listConfig = signal<ArticleListConfig>({ type: 'all', filters: {} });

  constructor() {
    this.facade.loadTags();

    // Set SEO metadata
    this.seoService.setPageMeta({
      title: $localize`:@@seo.home.title:Home`,
      description: $localize`:@@seo.home.description:A place to share your Angular knowledge.`,
      type: 'website',
      url: '/',
    });

    // Load initial articles based on auth status
    // Optimistic UI: Display Global Feed (unauthenticated state) first without waiting for auth check
    const initialConfig: ArticleListConfig = { type: 'all', filters: {} };
    this.listConfig.set(initialConfig);
    this.facade.loadArticles(initialConfig);

    // Switch feed if needed once auth status is determined
    this.authFacade.isAuthenticated$
      .pipe(
        filter((isAuth): isAuth is boolean => isAuth === true),
        take(1),
      )
      .subscribe(() => {
        // Switch to Your Feed once logged in is confirmed
        const config: ArticleListConfig = { type: 'feed', filters: {} };
        this.listConfig.set(config);
        this.facade.loadArticles(config);
      });
  }

  setListTo(type: 'all' | 'feed', filters: ArticleListConfig['filters'] = {}): void {
    // If feed is requested but user is not authenticated, redirect to login
    this.authFacade.isAuthenticated$
      .pipe(
        take(1),
        filter((isAuth) => type === 'feed' && !isAuth),
      )
      .subscribe(() => {
        this.router.navigate(['/login']);
      });

    this.authFacade.isAuthenticated$
      .pipe(
        take(1),
        filter((isAuth): isAuth is boolean => type !== 'feed' || isAuth === true),
      )
      .subscribe(() => {
        const config: ArticleListConfig = { type, filters };
        this.listConfig.set(config);
        this.facade.loadArticles(config);
      });
  }
}
