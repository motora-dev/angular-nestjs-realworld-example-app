import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";

import { PrismaAdapterModule } from "$adapters";
import { ArticleController } from "./article.controller";
import { GetArticleHandler, GetFirstPageIdHandler } from "./queries";
import { ArticleRepository } from "./repositories";
import { ArticleService } from "./services";

const ArticleHandlers = [GetArticleHandler, GetFirstPageIdHandler];

@Module({
  imports: [CqrsModule, ConfigModule, PrismaAdapterModule],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository, ...ArticleHandlers],
})
export class ArticleModule {}
