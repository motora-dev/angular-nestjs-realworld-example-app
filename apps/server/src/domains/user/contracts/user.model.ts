/**
 * User with account information from database
 */
export interface UserWithAccount {
  id: number;
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
}
