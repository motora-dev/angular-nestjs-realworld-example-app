import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetPageResponse } from './dto';
import { GetPageQuery } from './queries';

@Controller('article/:articleId/page')
export class ArticlePageController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':pageId')
  async getPage(@Param('articleId') _articleId: string, @Param('pageId') pageId: string): Promise<GetPageResponse> {
    return await this.queryBus.execute(new GetPageQuery(pageId));
  }
}
