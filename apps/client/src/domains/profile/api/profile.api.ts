import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_URL } from '$shared/lib';
import { Profile } from '../model';
import { ProfileResponse } from './profile.response';

@Injectable({ providedIn: 'root' })
export class ProfileApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  get(username: string): Observable<Profile> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profiles/${username}`).pipe(map((data) => data.profile));
  }

  follow(username: string): Observable<Profile> {
    return this.http
      .post<ProfileResponse>(`${this.apiUrl}/profiles/${username}/follow`, {})
      .pipe(map((data) => data.profile));
  }

  unfollow(username: string): Observable<Profile> {
    return this.http
      .delete<ProfileResponse>(`${this.apiUrl}/profiles/${username}/follow`)
      .pipe(map((data) => data.profile));
  }
}
