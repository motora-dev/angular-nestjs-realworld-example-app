import { ERROR_CODE } from '@monorepo/error-code';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

/**
 * RealWorld API - User DTO
 */
export class UserDto {
  @ApiProperty({ description: 'Email address', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  username: string;

  @ApiProperty({ description: 'User bio', example: 'I like to code', nullable: true })
  bio: string | null;

  @ApiProperty({ description: 'User image URL', example: 'https://example.com/avatar.jpg', nullable: true })
  image: string | null;
  // Note: RealWorld uses JWT token here, but we use OAuth session
  // token?: string;
}

/**
 * RealWorld API - User Response
 * GET /api/user
 * PUT /api/user
 */
export class UserResponseDto {
  @ApiProperty({ type: UserDto, description: 'User object' })
  user: UserDto;
}

/**
 * Update User Data (nested object for UpdateUserRequestDto)
 */
export class UpdateUserDto {
  @ApiProperty({ description: 'Email address', required: false, example: 'newemail@example.com' })
  @IsEmail({}, { message: ERROR_CODE.EMAIL_INVALID })
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Username', required: false, example: 'new_username', minLength: 3 })
  @IsString({ message: ERROR_CODE.USERNAME_REQUIRED })
  @MinLength(3, { message: ERROR_CODE.USERNAME_TOO_SHORT })
  @IsOptional()
  username?: string;

  @ApiProperty({ description: 'Password (not used in OAuth mode)', required: false })
  @IsString()
  @IsOptional()
  password?: string; // Not used in OAuth mode

  @ApiProperty({ description: 'User bio', required: false, example: 'Updated bio' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ description: 'User image URL', required: false, example: 'https://example.com/new-avatar.jpg' })
  @IsString()
  @IsOptional()
  image?: string;
}

/**
 * RealWorld API - Update User Request
 * PUT /api/user
 */
export class UpdateUserRequestDto {
  @ApiProperty({ type: UpdateUserDto, description: 'User update data' })
  @ValidateNested()
  @Type(() => UpdateUserDto)
  user: UpdateUserDto;
}

/**
 * Internal - Create User (OAuth flow)
 */
export class CreateUserDto {
  @ApiProperty({ description: 'OAuth provider', example: 'google' })
  provider: string;

  @ApiProperty({ description: 'OAuth provider ID', example: '123456789' })
  providerId: string;

  @ApiProperty({ description: 'Email address', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  username: string;

  @ApiProperty({ description: 'User image URL', required: false, example: 'https://example.com/avatar.jpg' })
  image?: string;
}

/**
 * Internal - Create User Response
 */
export class CreateUserResponseDto {
  @ApiProperty({ type: UserDto, description: 'User object' })
  user: UserDto;
}
