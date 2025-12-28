import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaAdapterModule } from '$adapters';
import { ArticleController } from '$domains/article/article.controller';
import { GetArticleHandler, GetCommentsHandler } from '$domains/article/queries';
import { ArticleRepository } from '$domains/article/repositories';
import { ArticleService } from '$domains/article/services';

const QueryHandlers = [GetArticleHandler, GetCommentsHandler];

@Module({
  imports: [CqrsModule, PrismaAdapterModule],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository, ...QueryHandlers],
})
export class ArticleModule {}
