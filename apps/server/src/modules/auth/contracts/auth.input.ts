/**
 * Auth API Input DTOs
 */

import { ERROR_CODE } from '@monorepo/error-code';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

/**
 * Register request for POST /auth/register
 */
export class RegisterDto {
  @ApiProperty({
    description: 'Username (alphanumeric and underscore only, min 3 characters)',
    example: 'john_doe',
    minLength: 3,
  })
  @IsString({ message: ERROR_CODE.USERNAME_REQUIRED })
  @IsNotEmpty({ message: ERROR_CODE.USERNAME_REQUIRED })
  @MinLength(3, { message: ERROR_CODE.USERNAME_TOO_SHORT })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: ERROR_CODE.USERNAME_INVALID_FORMAT })
  username: string;
}
