import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { map, Observable, ReplaySubject, tap } from 'rxjs';
import { LocalStorage } from '../local-storage';
import { AuthResponse, UpdateUser } from './user.types';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

  constructor(
    private _httpClient: HttpClient,
    private _localStorage: LocalStorage
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  get user$(): Observable<User> {
    return this._user.asObservable();
  }

  set user(value: User) {
    this._user.next(value);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /** Get the current logged in user data */
  get(): Observable<User> {
    return this._httpClient
      .get<User>('core/user/profile')
      .pipe(tap((user) => this._user.next(user)));
  }

  update(user: UpdateUser): Observable<User> {
    return this._httpClient
      .put<AuthResponse>('core/user/profile/update', user)
      .pipe(
        map((response) => {
          this._localStorage.accessToken = response.accessToken;
          this._localStorage.refreshToken = response.refreshToken;
          this._user.next(response.user);
          return response.user;
        })
      );
  }
}
