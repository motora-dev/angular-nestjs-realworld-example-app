import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaAdapterModule } from '$adapters';
import { ArticleController } from './article.controller';
import { GetArticleHandler, GetCommentsHandler } from './queries';
import { ArticleRepository } from './repositories';
import { ArticleService } from './services';

const QueryHandlers = [GetArticleHandler, GetCommentsHandler];

@Module({
  imports: [CqrsModule, PrismaAdapterModule],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository, ...QueryHandlers],
})
export class ArticleModule {}
