/**
 * RealWorld API - Profile DTO
 */
export interface ProfileDto {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

/**
 * RealWorld API - Profile Response
 * GET /api/profiles/:username
 * POST /api/profiles/:username/follow
 * DELETE /api/profiles/:username/follow
 */
export interface ProfileResponseDto {
  profile: ProfileDto;
}
