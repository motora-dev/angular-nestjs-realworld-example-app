import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { Article } from '$domains/article-list';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [DatePipe, RouterLink, TranslatePipe],
  templateUrl: './article-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleCardComponent {
  readonly article = input.required<Article>();
}
