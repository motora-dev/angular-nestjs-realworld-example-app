import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaAdapterModule } from '$adapters';
import { ArticlePageController } from './article-page.controller';
import { GetPageHandler } from './queries';
import { ArticlePageRepository } from './repositories';
import { ArticlePageService } from './services';

const ArticlePageHandlers = [GetPageHandler];

@Module({
  imports: [CqrsModule, PrismaAdapterModule],
  controllers: [ArticlePageController],
  providers: [ArticlePageService, ArticlePageRepository, ...ArticlePageHandlers],
})
export class ArticlePageModule {}
