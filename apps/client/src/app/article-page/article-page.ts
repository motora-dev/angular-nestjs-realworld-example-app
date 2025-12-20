import { ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RxIf } from '@rx-angular/template/if';
import { RxPush } from '@rx-angular/template/push';
import { combineLatest, filter, map } from 'rxjs';

import { ArticlePageFacade } from '$domains/article-page/article-page.facade';
import { SeoService } from '$modules/seo';
import { UiFacade } from '$modules/ui';
import {
  ArticlePageLeftSidebarComponent,
  ArticlePageContentComponent,
  ArticlePageRightSidebarComponent,
  ArticlePageNavigation,
} from './components';

@Component({
  selector: 'app-article-page',
  standalone: true,
  imports: [
    RxIf,
    RxPush,
    ArticlePageLeftSidebarComponent,
    ArticlePageContentComponent,
    ArticlePageRightSidebarComponent,
  ],
  providers: [ArticlePageFacade],
  templateUrl: './article-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePageComponent {
  // inject
  private readonly destroyRef = inject(DestroyRef);
  private readonly facade = inject(ArticlePageFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly seoService = inject(SeoService);
  private readonly uiFacade = inject(UiFacade);
  private readonly viewportScroller = inject(ViewportScroller);

  // Signal
  readonly articleId = signal<string>('');
  readonly pageId = signal<string>('');
  readonly isSidebarOpen = toSignal(this.uiFacade.isSidebarOpen$, { initialValue: false });

  // 直接のObservable（facadeから取得）
  readonly activeTocId$ = this.facade.activeTocId$;
  readonly currentPage$ = this.facade.currentPage$;
  readonly pages$ = this.facade.pages$;
  readonly toc$ = this.facade.toc$;

  readonly safeHtml$ = this.currentPage$.pipe(
    map((page) => (page ? this.sanitizer.bypassSecurityTrustHtml(page.content) : null)),
  );

  readonly navigation$ = combineLatest([this.pages$, this.route.paramMap]).pipe(
    map(([pages, params]): ArticlePageNavigation => {
      const pageId = params.get('pageId') || '';
      const sortedPages = [...pages].sort((a, b) => a.order - b.order);
      const currentIndex = sortedPages.findIndex((p) => p.id === pageId);

      return {
        prev: currentIndex > 0 ? sortedPages[currentIndex - 1] : null,
        next: currentIndex < sortedPages.length - 1 ? sortedPages[currentIndex + 1] : null,
      };
    }),
  );

  constructor() {
    const articleId = this.route.snapshot.paramMap.get('articleId') || '';
    const pageId = this.route.snapshot.paramMap.get('pageId') || '';

    this.articleId.set(articleId);
    this.pageId.set(pageId);

    this.facade.loadPage(articleId, pageId);

    // ページデータが読み込まれたらSEOメタタグを設定
    this.currentPage$
      .pipe(
        filter((page) => page !== null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((page) => {
        this.seoService.setPageMeta({
          title: page.title,
          description: page.description,
          type: 'article',
          url: `/article/${page.articleId}/${page.id}`,
          tags: [],
        });
      });

    // ルートパラメータの変更を監視
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const newArticleId = params.get('articleId') || '';
      const newPageId = params.get('pageId') || '';

      if (newArticleId !== this.articleId()) {
        this.articleId.set(newArticleId);
      }

      if (newPageId !== this.pageId()) {
        this.pageId.set(newPageId);
        this.facade.loadPage(newArticleId, newPageId);
        this.viewportScroller.scrollToPosition([0, 0]);
      }
    });
  }

  closeSidebar(): void {
    this.uiFacade.closeSidebar();
  }

  onTocClick(id: string): void {
    this.facade.setClickedTocId(id);
  }
}
