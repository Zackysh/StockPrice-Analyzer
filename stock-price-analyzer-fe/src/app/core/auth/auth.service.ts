import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { catchError, combineLatest, Observable, of, switchMap } from 'rxjs';
import { User } from '../user/user.types';

@Injectable()
export class AuthService {
  private _authenticated: boolean = false;

  constructor(
    private _httpClient: HttpClient,
    private _userService: UserService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  get accessToken(): string {
    return localStorage.getItem('accessToken') ?? '';
  }

  set accessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get refreshToken(): string {
    return localStorage.getItem('refreshToken') ?? '';
  }

  set refreshToken(token: string) {
    localStorage.setItem('refreshToken', token);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get mailVerified(): boolean {
    return JSON.parse(localStorage.getItem('mailVerified')) === true;
  }

  set mailVerified(verified: boolean) {
    localStorage.setItem('mailVerified', `${verified}`);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get isPremium(): boolean {
    return JSON.parse(localStorage.getItem('premium')) === true;
  }

  set isPremium(premium: boolean) {
    localStorage.setItem('premium', `${premium}`);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // @ Premium

  /**
   * Placeholder for stripe.
   *
   * @returns true if new plan is premium
   * @returns false if new plan is basic
   */
  togglePremiun(plan: 'premium' | 'basic'): Observable<boolean> {
    if (plan !== 'basic' && plan !== 'premium') {
      window.alert('nooooooooo');
    }
    if (this.isPremium && plan === 'premium') {
      return of(true);
    }
    if (!this.isPremium && plan === 'basic') {
      return of(false);
    }

    return combineLatest([
      this._userService.user$,
      this._httpClient.put('core/user/premium', null),
    ]).pipe(
      switchMap(([user]) => {
        this.isPremium = !this.isPremium;
        this._userService.user = { ...user, isPremium: this.isPremium };
        return of(this.isPremium);
      })
    );
  }

  // @ Email

  emailVerification(accessToken: string, code: string): Observable<any> {
    return this._httpClient
      .post(
        `core/user/confirm-email/${code}`,
        {},
        { headers: { authorization: accessToken } }
      )
      .pipe(
        catchError(() => of(false)),
        switchMap((err?: boolean) => {
          if (err !== false) {
            this.mailVerified = true;
            return of(true);
          }
          return of(false);
        })
      );
  }

  /**
   * Send email verification code.
   *
   * @returns true if email is sent
   * @returns false if email was already verified
   */
  sendMailVerificationCode(): Observable<any> {
    return this._httpClient
      .post(
        'core/user/send-confirm-email',
        {},
        { headers: { authorization: this.accessToken } }
      )
      .pipe(
        catchError(() =>
          // already verified
          of(false)
        ),
        switchMap((err) => {
          if (err !== false) {
            return of(true);
          }
          return of(false);
        })
      );
  }

  // @ Password

  sendRestorePasswordCode(credential: string): Observable<any> {
    return this._httpClient.post(
      `core/user/send-restore-password/${credential}`,
      {}
    );
  }

  checkRestorePasswordCode(
    credential: string,
    restorePasswordCode: string
  ): Observable<any> {
    return this._httpClient
      .post('core/user/check-restore-password', {
        credential,
        restorePasswordCode,
      })
      .pipe(
        catchError(() => of(false)),
        switchMap((err) => of(err !== false))
      );
  }

  resetPassword(
    credential: string,
    newPassword: string,
    restorePasswordCode: string
  ): Observable<any> {
    return this._httpClient.post('core/user/restore-password', {
      restorePasswordCode,
      credential,
      newPassword,
    });
  }

  // @ Basic auth

  signIn(credentials: {
    email: string;
    password: string;
  }): Observable<User | number> {
    const mockUser = {
      userId: 1,
      emailVerified: true,
      email: 'adri@gmail.com',
      username: 'adri',
    };

    this.accessToken = 'test';
    this.refreshToken = 'test';
    this._authenticated = true;
    this._userService.user = mockUser;
    this.mailVerified = true;
    this.isPremium = false;
    return of(mockUser);
    return this._httpClient.post('core/user/sign-in', credentials, {}).pipe(
      catchError((error: HttpErrorResponse) => of(error.status)),
      switchMap(
        (response: {
          accessToken: string;
          refreshToken: string;
          user: User;
        }) => {
          if (typeof response === 'number') {
            return of(response);
          }
          this.accessToken = response.accessToken;
          this.refreshToken = response.refreshToken;
          this._authenticated = true;
          this._userService.user = response.user;

          this.mailVerified = response.user.emailVerified ? true : false;
          this.isPremium = response.user.isPremium;

          // Return a new observable with the response
          return of(response.user);
        }
      )
    );
  }

  signOut(): Observable<any> {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('mailVerified');
    this._authenticated = false;

    return of(true);
  }

  signUp(user: User): Observable<any> {
    return this._httpClient.post('core/user/sign-up', user);
  }

  checkCredential(credential: string): Observable<boolean> {
    return this._httpClient
      .post(`core/user/check/credential/?credential=${credential}`, {})
      .pipe(
        catchError(() => of(false)),
        switchMap((err) => of(err !== false))
      );
  }

  checkUsername(username: string): Observable<boolean> {
    return this._httpClient
      .post(`core/user/check/username/?username=${username}`, {})
      .pipe(
        catchError(() => of(false)),
        switchMap((err) => of(err !== false))
      );
  }

  checkEmail(email: string): Observable<boolean> {
    return this._httpClient
      .post(`core/user/check/email/?email=${email}`, {})
      .pipe(
        catchError(() => of(false)),
        switchMap((err) => of(err !== false))
      );
  }

  /** Check the authentication status */
  check(): Observable<boolean> {
    if (this._authenticated && this.mailVerified) {
      return of(true);
    }

    return of(this.accessToken && this.mailVerified ? true : false);
  }
}
