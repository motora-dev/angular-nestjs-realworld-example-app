import { User } from '../model';

export interface CheckSessionResponse {
  authenticated: boolean;
  user?: User;
}

export interface LogoutResponse {
  success: boolean;
}

export interface UserResponse {
  user: User;
}
