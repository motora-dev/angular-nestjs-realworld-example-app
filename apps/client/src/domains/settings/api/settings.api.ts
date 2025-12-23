import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_URL } from '$shared/lib';
import { SettingsFormModel } from '../model';
import { UserResponse } from './settings.response';

@Injectable({ providedIn: 'root' })
export class SettingsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  getCurrentUser(): Observable<SettingsFormModel> {
    return this.http.get<UserResponse>(`${this.baseUrl}/user`).pipe(
      map((res) => ({
        image: res.user.image || '',
        username: res.user.username,
        bio: res.user.bio || '',
        email: res.user.email,
      })),
    );
  }

  updateUser(user: Partial<SettingsFormModel>): Observable<SettingsFormModel> {
    return this.http.put<UserResponse>(`${this.baseUrl}/user`, { user }).pipe(
      map((res) => ({
        image: res.user.image || '',
        username: res.user.username,
        bio: res.user.bio || '',
        email: res.user.email,
      })),
    );
  }
}
