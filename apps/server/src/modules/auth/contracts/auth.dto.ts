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
