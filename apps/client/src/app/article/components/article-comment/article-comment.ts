import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { Comment } from '$domains/comments';

@Component({
  selector: 'app-article-comment',
  standalone: true,
  imports: [DatePipe, RouterLink, TranslatePipe],
  templateUrl: './article-comment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleCommentComponent {
  readonly comment = input.required<Comment>();
  readonly canDelete = input<boolean>(false);

  readonly delete = output<void>();

  onDelete(): void {
    this.delete.emit();
  }
}
