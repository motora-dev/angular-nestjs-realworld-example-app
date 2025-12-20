import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  PLATFORM_ID,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RxUnpatch } from '@rx-angular/template/unpatch';
import { animationFrameScheduler, fromEvent } from 'rxjs';
import { auditTime } from 'rxjs/operators';

import { ArticlePageFacade } from '$domains/article-page/article-page.facade';
import { ArticlePage, ArticlePageItem, TocItem } from '$domains/article-page/model';

export interface ArticlePageNavigation {
  prev: ArticlePageItem | null;
  next: ArticlePageItem | null;
}

@Component({
  selector: 'app-article-page-content',
  standalone: true,
  imports: [RouterLink, TranslatePipe, RxUnpatch],
  templateUrl: './content.html',
  styleUrl: './content.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePageContentComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly facade = inject(ArticlePageFacade);

  readonly page = input.required<ArticlePage | null>();
  readonly safeHtml = input.required<SafeHtml | null>();
  readonly navigation = input.required<ArticlePageNavigation>();
  readonly articleId = input.required<string>();
  readonly toc = input.required<TocItem[]>();
  readonly pageId = input.required<string>();
  readonly activeTocId = input<string | null>(null);

  readonly tocClick = output<string>();

  constructor() {
    // スクロールイベントをブラウザでのみ監視
    afterNextRender(() => {
      // スクロールイベントを監視（50msに1回、rAFタイミング）
      fromEvent(window, 'scroll', { passive: true })
        .pipe(auditTime(50, animationFrameScheduler), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.updateActiveHeading());

      // 初期状態を設定
      this.updateActiveHeading();
    });

    // tocまたはsafeHtmlが変更されたら初期状態を再設定
    effect(() => {
      const tocItems = this.toc();
      const html = this.safeHtml();
      if (isPlatformBrowser(this.platformId) && tocItems.length > 0 && html) {
        requestAnimationFrame(() => this.updateActiveHeading());
      }
    });
  }

  /**
   * アクティブな見出しを更新
   * 1. ページ最下部 → 最後の見出し
   * 2. それ以外 → ヘッダー下を通過した最も下の見出し
   * 3. どれも通過していない → 最初の見出し
   */
  private updateActiveHeading(): void {
    const tocItems = this.toc();
    if (tocItems.length === 0) return;

    let activeId: string;

    // ページ最下部チェック（50px余裕）
    const isAtBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 50;
    if (isAtBottom) {
      activeId = tocItems[tocItems.length - 1].id;
    } else {
      // 通常判定：ヘッダー下を通過した最も下の見出し
      const headerOffset = 100;
      const fromTop = window.scrollY + headerOffset;

      // 逆順で探索：スクロール位置より上にある最も下の見出しを選択
      activeId = tocItems[0].id; // デフォルト: 最初の見出し
      for (let i = tocItems.length - 1; i >= 0; i--) {
        const element = document.getElementById(tocItems[i].id);
        if (element) {
          const elementTop = element.getBoundingClientRect().top + window.scrollY;
          if (elementTop <= fromTop) {
            activeId = tocItems[i].id;
            break;
          }
        }
      }
    }

    // スクロール監視で検出されたアクティブIDを更新
    this.facade.setScrollActiveTocId(activeId);

    // クリックで設定されたIDと一致したらクリア（目的地に到達）
    const clickedId = this.facade.getClickedTocIdSnapshot();
    if (clickedId && clickedId === activeId) {
      this.facade.setClickedTocId(null);
    }
  }

  /**
   * コンテンツ内のクリックを処理
   * 見出しアンカーリンクのクリックをインターセプトし、スムーズスクロールを行う
   */
  onContentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // クリックされた要素または親要素が.heading-anchorリンクか確認
    const anchor = target.closest('a.heading-anchor') as HTMLAnchorElement | null;
    if (!anchor) return;

    event.preventDefault();

    // hrefからハッシュ部分を抽出
    const href = anchor.getAttribute('href');
    if (!href) return;

    const hashIndex = href.indexOf('#');
    if (hashIndex === -1) return;

    const headingId = href.slice(hashIndex + 1);
    const element = document.getElementById(headingId);

    if (element) {
      // ヘッダーの高さを考慮してスクロール
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // URLハッシュを更新（replaceStateで履歴を汚さない）
      window.history.replaceState(null, '', `#${headingId}`);

      // クリックされた見出しをアクティブに設定
      this.facade.setClickedTocId(headingId);
    }
  }

  onTocClick(id: string): void {
    this.facade.setClickedTocId(id);
    this.tocClick.emit(id);
  }
}
