import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import type { CurrentUserType } from '$decorators';
import { CurrentUser } from '$decorators';
import { GoogleAuthGuard } from '$modules/auth/guards';
import { FollowUserCommand, UnfollowUserCommand } from './commands';
import { ProfileResponseDto } from './contracts';
import { GetProfileQuery } from './queries';

@ApiTags('Profile')
@Controller('profiles')
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
  @ApiOperation({
    summary: 'Get a profile',
    description: 'Get a user profile by username (auth optional)',
  })
  @ApiParam({ name: 'username', description: 'Username of the profile to get', example: 'john_doe' })
  @ApiOkResponse({ description: 'Profile retrieved successfully', type: ProfileResponseDto })
  @ApiNotFoundResponse({ description: 'Profile not found' })
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
  @ApiOperation({
    summary: 'Follow a user',
    description: 'Follow a user by username',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'username', description: 'Username of the user to follow', example: 'jane_doe' })
  @ApiOkResponse({ description: 'User followed successfully', type: ProfileResponseDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
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
  @ApiOperation({
    summary: 'Unfollow a user',
    description: 'Unfollow a user by username',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'username', description: 'Username of the user to unfollow', example: 'jane_doe' })
  @ApiOkResponse({ description: 'User unfollowed successfully', type: ProfileResponseDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
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
