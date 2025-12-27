import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Article } from '$domains/article';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './article-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListComponent {
  readonly articles = input.required<Article[]>();
}
