import { ApiProperty } from '@nestjs/swagger';

/**
 * RealWorld API - Profile DTO
 */
export class ProfileDto {
  @ApiProperty({ description: 'Username', example: 'john_doe' })
  username: string;

  @ApiProperty({ description: 'User bio', example: 'I like to code', nullable: true })
  bio: string | null;

  @ApiProperty({ description: 'User image URL', example: 'https://example.com/avatar.jpg', nullable: true })
  image: string | null;

  @ApiProperty({ description: 'Whether the current user is following this profile', example: false })
  following: boolean;
}

/**
 * RealWorld API - Profile Response
 * GET /api/profiles/:username
 * POST /api/profiles/:username/follow
 * DELETE /api/profiles/:username/follow
 */
export class ProfileResponseDto {
  @ApiProperty({ type: ProfileDto, description: 'Profile object' })
  profile: ProfileDto;
}
