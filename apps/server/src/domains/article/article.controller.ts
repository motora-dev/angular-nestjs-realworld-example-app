import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetArticleResponse, GetFirstPageIdResponse } from './dto';
import { GetArticleQuery, GetFirstPageIdQuery } from './queries';

@Controller('article')
export class ArticleController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':articleId')
  async getArticle(@Param('articleId') articleId: string): Promise<GetArticleResponse> {
    return await this.queryBus.execute(new GetArticleQuery(articleId));
  }

  @Get(':articleId/first-page-id')
  async getFirstPageId(@Param('articleId') articleId: string): Promise<GetFirstPageIdResponse> {
    return await this.queryBus.execute(new GetFirstPageIdQuery(articleId));
  }
}
