import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { catchError, Observable, throwError, switchMap } from 'rxjs';
import { LocalStorage } from './../local-storage';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private _authService: AuthService,
    private _localStorage: LocalStorage
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    let newReq = req.clone();

    // inject access token if available
    if (this._localStorage.accessToken) {
      newReq = req.clone({
        headers: req.headers.set(
          'Authorization',
          'Bearer ' + this._localStorage.accessToken
        ),
      });
    }

    return next.handle(newReq).pipe(
      catchError((error) => {
        // Catch "401 Unauthorized" responses
        if (
          error instanceof HttpErrorResponse &&
          error.status === 401 &&
          !['sign-in'].some((url) => error.url.includes(url))
        ) {
          this._authService.signOut();
          location.reload();
        }

        if (!(error instanceof HttpErrorResponse)) {
          console.error(error);
        }

        return throwError(() => error);
      })
    );
  }
}
