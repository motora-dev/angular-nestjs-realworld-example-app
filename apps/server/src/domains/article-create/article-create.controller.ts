import { Controller, Post, Req } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";

import { CreateArticleCommand } from "./commands";
import { CreateArticleResponseDto } from "./dto";

import type { Request } from "express";

@Controller("article")
export class ArticleCreateController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post("create")
  async createArticle(@Req() req: Request): Promise<CreateArticleResponseDto> {
    return await this.commandBus.execute(
      new CreateArticleCommand(req.user!.id)
    );
  }
}
