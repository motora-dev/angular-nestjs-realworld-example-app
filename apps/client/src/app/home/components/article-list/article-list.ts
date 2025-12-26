import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { Article } from '$domains/article';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [DatePipe, RouterLink, TranslatePipe],
  templateUrl: './article-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListComponent {
  readonly articles = input.required<Article[]>();
}
