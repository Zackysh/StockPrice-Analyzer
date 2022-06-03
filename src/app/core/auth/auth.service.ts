import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { LocalStorage } from '../local-storage';
import { AuthResponse, User, UserSignUp } from '../user/user.types';

@Injectable()
export class AuthService {
  constructor(
    private _httpClient: HttpClient,
    private _userService: UserService,
    private _localStorage: LocalStorage
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // --------------------------------------
  // @ Basic auth
  // --------------------------------------

  refreshToken(): Observable<AuthResponse> {
    return this._httpClient.post<AuthResponse>(
      'core/user/refresh-token',
      undefined
    );
  }

  signIn(credentials: {
    credential: string;
    password: string;
  }): Observable<User> {
    return this._httpClient.post('core/user/sign-in', credentials).pipe(
      catchError((error) =>
        throwError(() =>
          [401, 404].includes(error.status) ? error.status : error
        )
      ),
      switchMap(
        (response: {
          accessToken: string;
          refreshToken: string;
          user: User;
        }) => {
          this._localStorage.accessToken = response.accessToken;
          this._localStorage.refreshToken = response.refreshToken;
          this._userService.user = response.user;
          this._localStorage.emailVerified = response.user.emailVerified
            ? true
            : false;

          return of(response.user);
        }
      )
    );
  }

  signOut(): void {
    this._localStorage.removeAccessToken();
    this._localStorage.removeRefreshToken();
    this._localStorage.removeEmailVerified();
  }

  signUp(user: UserSignUp): Observable<AuthResponse> {
    console.log('signup');

    return this._httpClient.post<AuthResponse>('core/user/sign-up', user);
  }

  /**
   * Check if any user exists with provided credential.
   *
   * @returns 200 if user exists
   * @returns 404 if user does not exist
   * @returns error in case of unexpected error
   */
  checkUser(credential: string): Observable<number> {
    return this._httpClient
      .get<boolean>(`core/user/check-user?credential=${credential}`)
      .pipe(
        catchError((err) =>
          err.status === 404
            ? throwError(() => err.status)
            : throwError(() => err)
        ),
        switchMap(() => of(200))
      );
  }

  /** Check the authentication status */
  check(): Observable<boolean> {
    return of(
      this._localStorage.accessToken && this._localStorage.emailVerified
        ? true
        : false
    );
  }

  // --------------------------------------
  // @ Email
  // --------------------------------------

  /**
   * Verify user email.
   *
   * @returns 200 if code is valid
   * @returns 403 if code is wrong
   * @returns error in case of unexpected error
   */
  verifyEmail(code: string): Observable<number> {
    return this._httpClient
      .post<{ message: string }>('core/email-verification/verify', code)
      .pipe(
        catchError((err) =>
          err.status === 403
            ? throwError(() => err.status)
            : throwError(() => err)
        ),
        switchMap(() => {
          this._localStorage.emailVerified = true;
          return of(200);
        })
      );
  }

  /**
   * Ask server to send new email with verification code.
   *
   * @returns 200 if email is sent
   * @returns 409 if email was already verified
   * @returns error in case of unexpected error
   */
  sendEmailCode(): Observable<number> {
    return this._httpClient
      .get<{ message: string }>('core/email-verification/send')
      .pipe(
        catchError((err) =>
          err.status === 409
            ? throwError(() => err.status)
            : throwError(() => err)
        ),
        switchMap(() => of(200))
      );
  }

  // --------------------------------------
  // @ Password
  // --------------------------------------

  /**
   * Ask server to send new email with restore password code.
   *
   * @returns 200 if email is sent
   * @returns 404 if user is not found
   * @returns error in case of unexpected error
   */
  sendPasswordCode(credential: string): Observable<any> {
    return this._httpClient
      .get<{ message: string }>(
        `core/restore-password/send?credential=${credential}`
      )
      .pipe(
        catchError((err) =>
          err.status === 404
            ? throwError(() => err.status)
            : throwError(() => err)
        ),
        switchMap(() => of(200))
      );
  }

  /**
   * Check if provided restore password code is valid.
   *
   * @returns 200 if code is valid
   * @returns 403 if code is wrong
   * @returns 404 if user is not found
   * @returns error in case of unexpected error
   */
  checkPasswordCode(credential: string, code: string): Observable<any> {
    return this._httpClient
      .post<{ message: string }>('core/restore-password/check', {
        credential,
        code,
      })
      .pipe(
        catchError((err) =>
          [403, 404].includes(err.status)
            ? throwError(() => err.status)
            : throwError(() => err)
        ),
        switchMap(() => of(200))
      );
  }

  /**
   * Restore user password
   *
   * @returns 200 if password is restored
   * @returns 403 if code is wrong
   * @returns 404 if user is not found
   * @returns error in case of unexpected error
   */
  resetPassword(
    credential: string,
    password: string,
    code: string
  ): Observable<any> {
    console.log(credential, password, code);

    return this._httpClient
      .post<{ message: string }>('core/restore-password/reset', {
        code,
        credential,
        password,
      })
      .pipe(
        catchError((err) =>
          [403, 404].includes(err.status)
            ? throwError(() => err.status)
            : throwError(() => err)
        ),
        switchMap(() => of(200))
      );
  }
}
