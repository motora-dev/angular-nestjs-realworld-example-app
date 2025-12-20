import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";

import { CurrentUser } from "$decorators";
import { UpdateArticleCommand } from "./commands";
import {
  GetArticleResponseDto,
  UpdateArticleRequestDto,
  UpdateArticleResponseDto,
} from "./dto";
import { GetArticleQuery } from "./queries";

@Controller("article")
export class ArticleEditController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get("edit/:articleId")
  async getArticle(
    @CurrentUser() user: Express.UserPayload,
    @Param("articleId") articleId: string
  ): Promise<GetArticleResponseDto> {
    return await this.queryBus.execute(new GetArticleQuery(user.id, articleId));
  }

  @Put("update/:articleId")
  async updateArticle(
    @CurrentUser() user: Express.UserPayload,
    @Param("articleId") articleId: string,
    @Body() updateArticleRequestDto: UpdateArticleRequestDto
  ): Promise<UpdateArticleResponseDto> {
    return await this.commandBus.execute(
      new UpdateArticleCommand(
        user.id,
        articleId,
        updateArticleRequestDto.title,
        updateArticleRequestDto.tags,
        updateArticleRequestDto.content
      )
    );
  }
}
