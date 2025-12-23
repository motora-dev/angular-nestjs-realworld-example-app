import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RxLet } from '@rx-angular/template/let';
import { filter, take } from 'rxjs';

import { ArticleListConfig } from '$domains/article';
import { HomeFacade } from '$domains/home';
import { AuthFacade } from '$modules/auth';
import { ArticleListComponent } from './components/article-list/article-list';
import { TagListComponent } from './components/tag-list/tag-list';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RxLet, TranslatePipe, ArticleListComponent, TagListComponent],
  providers: [HomeFacade],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly facade = inject(HomeFacade);
  private readonly authFacade = inject(AuthFacade);

  readonly tags$ = this.facade.tags$;
  readonly articles$ = this.facade.articles$;
  readonly listConfig$ = this.facade.listConfig$;
  readonly isAuthenticated$ = this.authFacade.isAuthenticated$;

  readonly listConfig = signal<ArticleListConfig>({ type: 'all', filters: {} });

  constructor() {
    this.facade.loadTags();

    // Load initial articles based on auth status
    this.authFacade.isAuthenticated$.pipe(take(1)).subscribe((isAuth) => {
      const config: ArticleListConfig = isAuth ? { type: 'feed', filters: {} } : { type: 'all', filters: {} };
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
        filter((isAuth) => type !== 'feed' || isAuth),
      )
      .subscribe(() => {
        const config: ArticleListConfig = { type, filters };
        this.listConfig.set(config);
        this.facade.loadArticles(config);
      });
  }
}
