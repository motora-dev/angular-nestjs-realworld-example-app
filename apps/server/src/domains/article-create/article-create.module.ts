import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";

import { PrismaAdapterModule } from "$adapters";
import { ArticleCreateController } from "./article-create.controller";
import { CreateArticleHandler } from "./commands";
import { ArticleCreateRepository } from "./repositories";
import { ArticleCreateService } from "./services";

const ArticleEditHandlers = [CreateArticleHandler];

@Module({
  imports: [CqrsModule, ConfigModule, PrismaAdapterModule],
  controllers: [ArticleCreateController],
  providers: [
    ArticleCreateService,
    ArticleCreateRepository,
    ...ArticleEditHandlers,
  ],
})
export class ArticleCreateModule {}
