/**
 * Auth API Input DTOs
 */

import { ERROR_CODE } from '@monorepo/error-code';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

/**
 * Register request for POST /auth/register
 */
export class RegisterDto {
  @IsString({ message: ERROR_CODE.USERNAME_REQUIRED })
  @IsNotEmpty({ message: ERROR_CODE.USERNAME_REQUIRED })
  @MinLength(3, { message: ERROR_CODE.USERNAME_TOO_SHORT })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: ERROR_CODE.USERNAME_INVALID_FORMAT })
  username: string;
}
