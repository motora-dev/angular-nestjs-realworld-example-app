import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { Article } from '$domains/article';

@Component({
  selector: 'app-article-meta',
  standalone: true,
  imports: [DatePipe, RouterLink, TranslatePipe],
  templateUrl: './article-meta.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleMetaComponent {
  readonly article = input.required<Article>();
  readonly canModify = input<boolean>(false);
  readonly isDeleting = input<boolean>(false);

  readonly favorite = output<void>();
  readonly delete = output<void>();

  onFavorite(): void {
    this.favorite.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }
}
