import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_URL } from '$shared/lib';
import { User } from '../model';
import {
  CheckSessionResponse,
  LogoutResponse,
  PendingRegistrationResponse,
  RegisterResponse,
  UserResponse,
} from './auth.response';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  checkSession(): Observable<CheckSessionResponse> {
    return this.http.get<CheckSessionResponse>(`${this.baseUrl}/auth/check-session`);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<UserResponse>(`${this.baseUrl}/user`).pipe(map((res) => res.user));
  }

  updateUser(user: Partial<User>): Observable<User> {
    return this.http.put<UserResponse>(`${this.baseUrl}/user`, { user }).pipe(map((res) => res.user));
  }

  logout(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(`${this.baseUrl}/auth/logout`, {});
  }

  getPendingRegistration(): Observable<PendingRegistrationResponse | null> {
    return this.http.get<PendingRegistrationResponse | null>(`${this.baseUrl}/auth/pending-registration`);
  }

  register(username: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, { username });
  }
}
