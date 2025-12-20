import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { Article } from '$domains/article-list';
import { ArticleCardComponent } from '../article-card';

@Component({
  selector: 'app-article-list-content',
  standalone: true,
  imports: [TranslatePipe, ArticleCardComponent],
  templateUrl: './content.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListContentComponent {
  readonly articles = input.required<Article[]>();
}
