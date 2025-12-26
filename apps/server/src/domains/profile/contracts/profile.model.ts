/**
 * User profile from database
 */
export interface UserProfile {
  id: number;
  username: string;
  bio: string | null;
  image: string | null;
}
