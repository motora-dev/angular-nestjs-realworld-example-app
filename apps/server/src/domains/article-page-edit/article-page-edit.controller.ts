import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";

import { CurrentUser } from "$decorators";
import { UpdatePageCommand } from "./commands";
import {
  GetPageResponseDto,
  GetPagesResponseDto,
  UpdatePageRequestDto,
  UpdatePageResponseDto,
} from "./dto";
import { GetPageQuery, GetPagesQuery } from "./queries";

@Controller("article-page-edit")
export class ArticlePageEditController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get(":articleId/page")
  async getPages(
    @CurrentUser() user: Express.UserPayload,
    @Param("articleId") articleId: string
  ): Promise<GetPagesResponseDto> {
    return await this.queryBus.execute(new GetPagesQuery(user.id, articleId));
  }

  @Get(":articleId/page/:pageId")
  async getPage(
    @CurrentUser() user: Express.UserPayload,
    @Param("articleId") articleId: string,
    @Param("pageId") pageId: string
  ): Promise<GetPageResponseDto> {
    return await this.queryBus.execute(
      new GetPageQuery(user.id, articleId, pageId)
    );
  }

  @Put(":articleId/page/:pageId")
  async updatePage(
    @CurrentUser() user: Express.UserPayload,
    @Param("articleId") articleId: string,
    @Param("pageId") pageId: string,
    @Body() updatePageRequestDto: UpdatePageRequestDto
  ): Promise<UpdatePageResponseDto> {
    return await this.commandBus.execute(
      new UpdatePageCommand(
        user.id,
        articleId,
        pageId,
        updatePageRequestDto.title,
        updatePageRequestDto.description,
        updatePageRequestDto.content
      )
    );
  }
}
