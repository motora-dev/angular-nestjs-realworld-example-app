/**
 * Auth API Response DTOs
 */

/**
 * User response for GET /auth/me
 */
export interface UserResponse {
  id: string; // publicId
  username: string;
}

/**
 * Register response for POST /auth/register
 */
export interface RegisterResponse {
  id: string; // publicId
  username: string;
  email: string;
}
