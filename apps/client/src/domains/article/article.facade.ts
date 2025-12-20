import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { SpinnerFacade } from '$modules/spinner';
import { ArticleApi } from './api';

@Injectable()
export class ArticleFacade {
  private readonly api = inject(ArticleApi);
  private readonly spinnerFacade = inject(SpinnerFacade);

  getFirstPageId(articleId: string): Observable<string> {
    return this.api.getFirstPageId(articleId).pipe(
      this.spinnerFacade.withSpinner(),
      map((response) => response.firstPageId),
    );
  }
}
