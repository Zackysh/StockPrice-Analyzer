/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable, LOCALE_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorage {
  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  // @ Access token
  private ACCESS_KEY = 'accessToken' as const;
  get accessToken(): string {
    return localStorage.getItem(this.ACCESS_KEY) ?? '';
  }
  set accessToken(token: string) {
    localStorage.setItem(this.ACCESS_KEY, token);
  }

  public removeAccessToken(): void {
    localStorage.removeItem(this.ACCESS_KEY);
  }

  // @ Refresh token
  private REFRESH_KEY = 'refreshToken' as const;
  get refreshToken(): string {
    return localStorage.getItem(this.REFRESH_KEY) ?? '';
  }
  set refreshToken(token: string) {
    localStorage.setItem(this.REFRESH_KEY, token);
  }

  public removeRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_KEY);
  }

  // @ Mail verified
  private EMVERIFIED_KEY = 'emailVerified' as const;
  get emailVerified(): boolean {
    return JSON.parse(localStorage.getItem(this.EMVERIFIED_KEY)) === true;
  }
  set emailVerified(verified: boolean) {
    localStorage.setItem(this.EMVERIFIED_KEY, `${verified}`);
  }

  public removeEmailVerified(): void {
    localStorage.removeItem(this.EMVERIFIED_KEY);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public Methods
  // -----------------------------------------------------------------------------------------------------

  public clear(): void {
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.EMVERIFIED_KEY);
  }
}
