import { inject, Injectable } from "@angular/core";
import { Store } from "@ngxs/store";

import { SpinnerFacade } from "$modules/spinner";
import { ArticlePageApi } from "./api";
import {
  ArticlePageState,
  SetClickedTocId,
  SetScrollActiveTocId,
} from "./store";

@Injectable()
export class ArticlePageFacade {
  private readonly store = inject(Store);
  private readonly api = inject(ArticlePageApi);
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly pages$ = this.store.select(ArticlePageState.getArticlePageItems);
  readonly currentPage$ = this.store.select(ArticlePageState.getArticlePage);
  readonly toc$ = this.store.select(ArticlePageState.getToc);
  readonly activeTocId$ = this.store.select(ArticlePageState.getActiveTocId);
  readonly clickedTocId$ = this.store.select(ArticlePageState.getClickedTocId);

  setScrollActiveTocId(id: string | null): void {
    this.store.dispatch(new SetScrollActiveTocId(id));
  }

  setClickedTocId(id: string | null): void {
    this.store.dispatch(new SetClickedTocId(id));
  }

  getClickedTocIdSnapshot(): string | null {
    return this.store.selectSnapshot(ArticlePageState.getClickedTocId);
  }

  loadPage(articleId: string, pageId: string): void {
    this.api
      .getPage(articleId, pageId)
      .pipe(this.spinnerFacade.withSpinner())
      .subscribe();
  }
}
