import { Body, Controller, Get, HttpCode, HttpStatus, Put, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import type { CurrentUserType } from '$decorators';
import { CurrentUser } from '$decorators';
import { GoogleAuthGuard } from '$modules/auth/guards';
import { UpdateUserCommand } from './commands';
import { UpdateUserRequestDto, UserResponseDto } from './contracts';
import { GetCurrentUserQuery } from './queries';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
@UseGuards(GoogleAuthGuard)
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
  @ApiOperation({
    summary: 'Get current user',
    description: 'Returns the authenticated user information',
  })
  @ApiOkResponse({ description: 'Current user info', type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
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
  @ApiOperation({
    summary: 'Update current user',
    description: 'Update the authenticated user profile',
  })
  @ApiOkResponse({ description: 'Updated user info', type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @Put()
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @CurrentUser() user: CurrentUserType,
    @Body() request: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    return this.commandBus.execute(new UpdateUserCommand(user.id, request));
  }
}
