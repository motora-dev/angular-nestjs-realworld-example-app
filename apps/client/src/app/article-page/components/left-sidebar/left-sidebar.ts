import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RxUnpatch } from '@rx-angular/template/unpatch';

import { ArticlePageItem } from '$domains/article-page/model';

@Component({
  selector: 'app-article-page-left-sidebar',
  standalone: true,
  imports: [RouterLink, TranslatePipe, RxUnpatch],
  templateUrl: './left-sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePageLeftSidebarComponent {
  readonly pages = input.required<ArticlePageItem[]>();
  readonly articleId = input.required<string>();
  readonly currentPageId = input.required<string>();
  readonly isOpen = input.required<boolean>();

  readonly closeSidebar = output<void>();

  isCurrentPage(page: ArticlePageItem): boolean {
    return page.id === this.currentPageId();
  }

  getIndentClass(page: ArticlePageItem): string {
    return page.level === 2 ? 'ml-4' : '';
  }

  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }
}
