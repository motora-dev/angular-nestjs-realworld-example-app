import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaAdapterModule } from '$adapters';
import { ArticleListController } from './article-list.controller';
import { GetArticlesHandler, GetFeedHandler, GetTagsHandler } from './queries';
import { ArticleListRepository } from './repositories';
import { ArticleListService } from './services';

const QueryHandlers = [GetArticlesHandler, GetFeedHandler, GetTagsHandler];

@Module({
  imports: [CqrsModule, PrismaAdapterModule],
  controllers: [ArticleListController],
  providers: [ArticleListService, ArticleListRepository, ...QueryHandlers],
})
export class ArticleListModule {}
