import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaAdapterModule } from '$adapters';
import { ArticleListController } from './article-list.controller';
import { GetArticleListHandler } from './queries';
import { ArticleListRepository } from './repositories';
import { ArticleListService } from './services';

const ArticleHandlers = [GetArticleListHandler];

@Module({
  imports: [CqrsModule, PrismaAdapterModule],
  controllers: [ArticleListController],
  providers: [ArticleListService, ArticleListRepository, ...ArticleHandlers],
})
export class ArticleListModule {}
