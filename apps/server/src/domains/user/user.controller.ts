import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";

import { CreateUserCommand } from "./commands";
import {
  CreateUserDto,
  CreateUserResponseDto,
  GetUserResponseDto,
} from "./dto";
import { GetUserQuery } from "./queries";

@Controller("user")
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  /**
   * 現在ログインしているユーザーの情報を取得
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getUser(@Req() req: any): Promise<GetUserResponseDto> {
    return await this.queryBus.execute(
      new GetUserQuery(req.user.provider, req.user.sub)
    );
  }

  /**
   * 新規ユーザーを作成
   */
  @Post("create")
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Req() req: any,
    @Body() dto: CreateUserDto
  ): Promise<CreateUserResponseDto> {
    return await this.commandBus.execute(
      new CreateUserCommand(
        req.user.provider,
        req.user.sub,
        req.user.email,
        dto.name
      )
    );
  }
}
