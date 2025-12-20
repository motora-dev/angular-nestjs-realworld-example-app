import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetPageQuery } from './get-page.query';
import { GetPageResponse } from '../../dto';
import { ArticlePageService } from '../../services';

@QueryHandler(GetPageQuery)
export class GetPageHandler implements IQueryHandler<GetPageQuery> {
  constructor(private readonly articlePageService: ArticlePageService) {}

  async execute(query: GetPageQuery): Promise<GetPageResponse> {
    const { page, pages } = await this.articlePageService.getPage(query.pageId);

    return {
      id: page.publicId,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      title: page.title,
      description: page.description,
      articleId: page.article.publicId,
      content: page.content,
      level: page.level,
      order: page.order,
      tags: page.article.tags,
      pages: pages.map((p) => ({
        id: p.publicId,
        title: p.title,
        level: p.level,
        order: p.order,
      })),
    };
  }
}
