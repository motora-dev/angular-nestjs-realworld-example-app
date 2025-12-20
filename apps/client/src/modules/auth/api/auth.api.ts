import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '$shared/lib';
import { CheckSessionResponse, LogoutResponse } from './auth.response';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  checkSession(): Observable<CheckSessionResponse> {
    return this.http.get<CheckSessionResponse>(`${this.baseUrl}/auth/check-session`);
  }

  logout(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(`${this.baseUrl}/auth/logout`, {});
  }
}
