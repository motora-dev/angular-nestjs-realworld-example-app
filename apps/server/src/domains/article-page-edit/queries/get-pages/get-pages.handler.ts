import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetPagesResponseDto } from '$domains/article-page-edit/dto';
import { ArticlePageEditService } from '$domains/article-page-edit/services';
import { GetPagesQuery } from './get-pages.query';

@QueryHandler(GetPagesQuery)
export class GetPagesHandler implements IQueryHandler<GetPagesQuery> {
  constructor(private readonly articlePageEditService: ArticlePageEditService) {}

  async execute(query: GetPagesQuery): Promise<GetPagesResponseDto> {
    const pages = await this.articlePageEditService.getPages(query.userId, query.articleId);

    return {
      pages: pages.map((page) => ({
        id: page.publicId,
        title: page.title,
        level: page.level,
        order: page.order,
      })),
    };
  }
}
