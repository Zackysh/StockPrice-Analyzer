import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { map, Observable, of, ReplaySubject, tap } from 'rxjs';
import { UpdateUser } from './user.types';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

  constructor(private _httpClient: HttpClient) {}

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
    const mockUser = {
      userId: 1,
      emailVerified: true,
      email: 'adri@gmail.com',
      username: 'adri',
    };
    return of(mockUser);
    return this._httpClient
      .get<User>('core/user/profile')
      .pipe(tap((user) => this._user.next(user)));
  }

  update(user: UpdateUser): Observable<User> {
    return this._httpClient
      .put<{ accessToken: string; refreshToken: string; user: User }>(
        'core/user/update-profile',
        user
      )
      .pipe(
        map((response) => {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          this._user.next(response.user);
          return response.user;
        })
      );
  }
}
