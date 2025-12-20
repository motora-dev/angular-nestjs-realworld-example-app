import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RxUnpatch } from '@rx-angular/template/unpatch';

import { TocItem } from '$domains/article-page/model';

@Component({
  selector: 'app-article-page-right-sidebar',
  standalone: true,
  imports: [TranslatePipe, RxUnpatch],
  templateUrl: './right-sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePageRightSidebarComponent {
  private readonly tocNavRef = viewChild<ElementRef<HTMLElement>>('tocNav');
  private readonly translate = inject(TranslateService);

  readonly toc = input.required<TocItem[]>();
  readonly articleId = input.required<string>();
  readonly pageId = input.required<string>();
  readonly activeTocId = input<string | null>(null);

  readonly tocClick = output<string>();

  constructor() {
    effect(() => {
      const activeId = this.activeTocId();
      if (activeId && this.tocNavRef()) {
        this.scrollToActiveItem(activeId);
      }
    });
  }

  getAriaLabel(item: TocItem): string {
    return this.translate.instant('articlePage.goToHeading', { text: item.text });
  }

  private scrollToActiveItem(id: string): void {
    const navElement = this.tocNavRef()?.nativeElement;
    const activeElement = navElement?.querySelector(`[data-toc-id="${id}"]`);
    activeElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  getTocIndentClass(item: TocItem): string {
    if (item.level === 2) return 'ml-3';
    if (item.level === 3) return 'ml-6';
    if (item.level >= 4) return 'ml-9';
    return '';
  }

  isActive(item: TocItem): boolean {
    return item.id === this.activeTocId();
  }

  onTocClick(event: Event, item: TocItem): void {
    event.preventDefault();

    const element = document.getElementById(item.id);
    if (element) {
      // ヘッダーの高さ（64px）を考慮してスクロール
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // URLハッシュを更新
      window.history.pushState(null, '', `#${item.id}`);

      // 親にクリックされたIDを通知
      this.tocClick.emit(item.id);
    }
  }
}
