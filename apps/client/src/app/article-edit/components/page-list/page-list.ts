import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { ArticleEditPageItem } from '$domains/article-edit/model';

@Component({
  selector: 'app-page-list',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './page-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageListComponent {
  readonly pages = input.required<ArticleEditPageItem[]>();
  readonly pageEdit = output<{ articleId: string; pageId: string }>();

  onPageEdit(articleId: string, pageId: string): void {
    this.pageEdit.emit({ articleId, pageId });
  }
}
