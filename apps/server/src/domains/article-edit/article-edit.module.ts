import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";

import { PrismaAdapterModule } from "$adapters";
import { ArticleEditController } from "$domains/article-edit/article-edit.controller";
import { UpdateArticleHandler } from "$domains/article-edit/commands";
import { GetArticleHandler } from "$domains/article-edit/queries";
import { ArticleEditRepository } from "$domains/article-edit/repositories";
import { ArticleEditService } from "$domains/article-edit/services";

const ArticleEditHandlers = [UpdateArticleHandler, GetArticleHandler];

@Module({
  imports: [CqrsModule, ConfigModule, PrismaAdapterModule],
  controllers: [ArticleEditController],
  providers: [
    ArticleEditService,
    ArticleEditRepository,
    ...ArticleEditHandlers,
  ],
})
export class ArticleEditModule {}
