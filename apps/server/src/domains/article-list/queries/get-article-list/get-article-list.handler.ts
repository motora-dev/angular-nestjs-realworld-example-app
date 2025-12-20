import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetArticleListQuery } from './get-article-list.query';
import { ArticleListDto } from '../../dto';
import { ArticleListService } from '../../services';

@QueryHandler(GetArticleListQuery)
export class GetArticleListHandler implements IQueryHandler<GetArticleListQuery> {
  constructor(private readonly articleListService: ArticleListService) {}

  async execute(): Promise<ArticleListDto> {
    return await this.articleListService.getArticleList();
  }
}
