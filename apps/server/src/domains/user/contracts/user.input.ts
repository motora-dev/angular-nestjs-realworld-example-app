/**
 * Repository input params
 */
export interface CreateUserParams {
  provider: string;
  providerId: string;
  email: string;
  username: string;
  image?: string;
}

export interface UpdateUserParams {
  email?: string;
  username?: string;
  bio?: string;
  image?: string;
}
