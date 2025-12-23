import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import type { CurrentUserType } from '$decorators';
import { CurrentUser } from '$decorators';
import { GoogleAuthGuard } from '$guards';
import { FollowUserCommand, UnfollowUserCommand } from './commands';
import { GetProfileQuery } from './queries';

import type { ProfileResponseDto } from './contracts';

@Controller('api/profiles')
export class ProfileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * GET /api/profiles/:username
   * Get a profile
   * Auth is optional
   */
  @Get(':username')
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @Param('username') username: string,
    @CurrentUser() user?: CurrentUserType,
  ): Promise<ProfileResponseDto> {
    return this.queryBus.execute(new GetProfileQuery(username, user?.id));
  }

  /**
   * POST /api/profiles/:username/follow
   * Follow a user
   * Auth is required
   */
  @UseGuards(GoogleAuthGuard)
  @Post(':username/follow')
  @HttpCode(HttpStatus.OK)
  async followUser(
    @Param('username') username: string,
    @CurrentUser() user: CurrentUserType,
  ): Promise<ProfileResponseDto> {
    return this.commandBus.execute(new FollowUserCommand(username, user.id));
  }

  /**
   * DELETE /api/profiles/:username/follow
   * Unfollow a user
   * Auth is required
   */
  @UseGuards(GoogleAuthGuard)
  @Delete(':username/follow')
  @HttpCode(HttpStatus.OK)
  async unfollowUser(
    @Param('username') username: string,
    @CurrentUser() user: CurrentUserType,
  ): Promise<ProfileResponseDto> {
    return this.commandBus.execute(new UnfollowUserCommand(username, user.id));
  }
}
