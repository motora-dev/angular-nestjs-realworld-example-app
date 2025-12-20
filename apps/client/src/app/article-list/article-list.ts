import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RxLet } from '@rx-angular/template/let';

import { ArticleListFacade } from '$domains/article-list';
import { SeoService } from '$modules/seo';
import { ArticleListContentComponent } from './components';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RxLet, ArticleListContentComponent],
  providers: [ArticleListFacade],
  templateUrl: './article-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListComponent {
  private readonly facade = inject(ArticleListFacade);
  private readonly seoService = inject(SeoService);

  readonly articleList$ = this.facade.articleList$;

  constructor() {
    this.facade.loadArticleList();

    // 静的メタタグを設定
    this.seoService.setPageMeta({
      title: '記事一覧',
      description: 'もとらによる技術ブログ。Web開発、NestJS、Angularなどの技術記事を発信しています。',
      url: '/',
    });
  }
}
