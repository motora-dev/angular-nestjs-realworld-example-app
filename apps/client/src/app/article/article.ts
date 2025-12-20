import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';

import { ArticleFacade } from '$domains/article';
import { NotFoundError } from '$modules/error/client-errors';

@Component({
  selector: 'app-article',
  standalone: true,
  template: '',
  providers: [ArticleFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(ArticleFacade);
  private readonly translate = inject(TranslateService);

  constructor() {
    const articleId = this.route.snapshot.paramMap.get('articleId') || '';

    if (!articleId) {
      throw new NotFoundError(this.translate.instant('article.errors.articleIdRequired'));
    }

    this.facade
      .getFirstPageId(articleId)
      .pipe(take(1))
      .subscribe((firstPageId) => {
        this.router.navigate(['/article', articleId, firstPageId], { replaceUrl: true });
      });
  }
}
