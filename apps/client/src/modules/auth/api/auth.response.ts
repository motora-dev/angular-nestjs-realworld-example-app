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

export interface PendingRegistrationResponse {
  email: string;
}

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
}
