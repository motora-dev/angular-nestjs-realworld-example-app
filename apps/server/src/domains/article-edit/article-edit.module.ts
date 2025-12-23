import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaAdapterModule } from '$adapters';
import { ArticleEditController } from './article-edit.controller';
import {
  CreateArticleHandler,
  CreateCommentHandler,
  DeleteArticleHandler,
  DeleteCommentHandler,
  FavoriteArticleHandler,
  UnfavoriteArticleHandler,
  UpdateArticleHandler,
} from './commands';
import { GetArticleForEditHandler } from './queries';
import { ArticleEditRepository, ArticleEditQueryRepository } from './repositories';
import { ArticleEditService } from './services';

const CommandHandlers = [
  CreateArticleHandler,
  UpdateArticleHandler,
  DeleteArticleHandler,
  FavoriteArticleHandler,
  UnfavoriteArticleHandler,
  CreateCommentHandler,
  DeleteCommentHandler,
];

const QueryHandlers = [GetArticleForEditHandler];

@Module({
  imports: [CqrsModule, PrismaAdapterModule],
  controllers: [ArticleEditController],
  providers: [
    ArticleEditService,
    ArticleEditRepository,
    ArticleEditQueryRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class ArticleEditModule {}
