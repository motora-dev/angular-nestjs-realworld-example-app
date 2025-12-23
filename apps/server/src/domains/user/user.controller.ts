import { Body, Controller, Get, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import type { CurrentUserType } from '$decorators';
import { CurrentUser } from '$decorators';
import { UpdateUserCommand } from './commands';
import { GetCurrentUserQuery } from './queries';

import type { UpdateUserRequestDto, UserResponseDto } from './contracts';

@Controller('api/user')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * GET /api/user
   * Get current user
   * Auth is required
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@CurrentUser() user: CurrentUserType): Promise<UserResponseDto> {
    return this.queryBus.execute(new GetCurrentUserQuery(user.id));
  }

  /**
   * PUT /api/user
   * Update current user
   * Auth is required
   */
  @Put()
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @CurrentUser() user: CurrentUserType,
    @Body() request: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    return this.commandBus.execute(new UpdateUserCommand(user.id, request));
  }
}
