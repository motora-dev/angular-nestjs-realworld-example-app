import { User } from '../model';

export interface LogoutResponse {
  success: boolean;
}

export interface UserResponse {
  user: User;
}

export interface CheckSessionResponse {
  authenticated: boolean;
  user?: User;
}
