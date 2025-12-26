import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '$shared/lib';
import { PendingRegistrationResponse, RegisterResponse } from './auth-register.response';

@Injectable({ providedIn: 'root' })
export class AuthRegisterApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  getPendingRegistration(): Observable<PendingRegistrationResponse | null> {
    return this.http.get<PendingRegistrationResponse | null>(`${this.baseUrl}/auth/pending-registration`);
  }

  register(username: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, { username });
  }
}
