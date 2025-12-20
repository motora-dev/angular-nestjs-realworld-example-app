import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";

import { PrismaAdapterModule } from "$adapters";
import { ArticleEditRepository } from "$domains/article-edit/repositories";
import { ArticlePageEditController } from "$domains/article-page-edit/article-page-edit.controller";
import { UpdatePageHandler } from "$domains/article-page-edit/commands";
import {
  GetPageHandler,
  GetPagesHandler,
} from "$domains/article-page-edit/queries";
import { ArticlePageEditRepository } from "$domains/article-page-edit/repositories";
import { ArticlePageEditService } from "$domains/article-page-edit/services";

const ArticlePageEditHandlers = [
  UpdatePageHandler,
  GetPagesHandler,
  GetPageHandler,
];

@Module({
  imports: [CqrsModule, ConfigModule, PrismaAdapterModule],
  controllers: [ArticlePageEditController],
  providers: [
    ArticlePageEditService,
    ArticlePageEditRepository,
    ArticleEditRepository,
    ...ArticlePageEditHandlers,
  ],
})
export class ArticlePageEditModule {}
