/**
 * RealWorld API - User DTO
 */
export interface UserDto {
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  // Note: RealWorld uses JWT token here, but we use OAuth session
  // token?: string;
}

/**
 * RealWorld API - User Response
 * GET /api/user
 * PUT /api/user
 */
export interface UserResponseDto {
  user: UserDto;
}

/**
 * RealWorld API - Update User Request
 * PUT /api/user
 */
export interface UpdateUserRequestDto {
  user: {
    email?: string;
    username?: string;
    password?: string; // Not used in OAuth mode
    bio?: string;
    image?: string;
  };
}

/**
 * Internal - Create User (OAuth flow)
 */
export interface CreateUserDto {
  provider: string;
  providerId: string;
  email: string;
  username: string;
  image?: string;
}

/**
 * Internal - Create User Response
 */
export interface CreateUserResponseDto {
  user: UserDto;
}

