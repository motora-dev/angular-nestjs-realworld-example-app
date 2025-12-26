/**
 * Auth API Response DTOs
 */

import { ApiProperty } from '@nestjs/swagger';

/**
 * User response for GET /auth/me
 */
export class UserResponse {
  @ApiProperty({ description: 'User public ID', example: 'clxxxxxxxxxxxxxxxxxx' })
  id: string; // publicId

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  username: string;
}

/**
 * Register response for POST /auth/register
 */
export class RegisterResponse {
  @ApiProperty({ description: 'User public ID', example: 'clxxxxxxxxxxxxxxxxxx' })
  id: string; // publicId

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  username: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  email: string;
}

/**
 * User info object for CheckSessionResponse
 */
export class UserInfo {
  @ApiProperty({ description: 'Username', example: 'john_doe' })
  username: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  email: string;

  @ApiProperty({ description: 'User bio', example: 'I like to code' })
  bio: string;

  @ApiProperty({ description: 'User image URL', example: 'https://example.com/image.jpg' })
  image: string;
}

/**
 * Check session response for GET /auth/check-session
 */
export class CheckSessionResponse {
  @ApiProperty({ description: 'Authentication status', example: true })
  authenticated: boolean;

  @ApiProperty({ description: 'User info (only if authenticated)', required: false, type: UserInfo })
  user?: UserInfo;
}

/**
 * Pending registration response for GET /auth/pending-registration
 */
export class PendingRegistrationResponse {
  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  email: string;
}
