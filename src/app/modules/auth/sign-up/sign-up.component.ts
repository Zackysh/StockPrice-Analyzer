import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from 'app/core/auth/auth.service';
import {
  catchError,
  combineLatest,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';

@Component({
  selector: 'auth-sign-up',
  templateUrl: './sign-up.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class AuthSignUpComponent implements OnInit {
  signUpForm: FormGroup;

  constructor(
    private _authService: AuthService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _snackBar: MatSnackBar
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.signUpForm = this._formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  signUp(): void {
    if (this.signUpForm.invalid) {
      return;
    }

    this.signUpForm.disable();
    this.#asyncValidation()
      .pipe(
        catchError((err) => {
          console.log(err);
          return err;
        }),
        switchMap(() => this._authService.signUp(this.signUpForm.value))
      )
      .subscribe(() => this.#navigateSignIn());
  }

  #asyncValidation(): Observable<boolean> {
    return combineLatest([
      this._authService
        .checkUser(this.signUpForm.value.email)
        .pipe(catchError((err: any) => of(err))),
      this._authService
        .checkUser(this.signUpForm.value.username)
        .pipe(catchError((err: any) => of(err))),
    ]).pipe(
      switchMap((res) => {
        if (res[0] === 200) {
          this.signUpForm.enable();
          const ctrl = this.signUpForm.get('email');
          ctrl.setErrors({ ...ctrl.errors, 'not-available': 'true' });
        }

        if (res[1] === 200) {
          this.signUpForm.enable();
          const ctrl = this.signUpForm.get('username');
          ctrl.setErrors({ ...ctrl.errors, 'not-available': 'true' });
        }
        console.log('here');

        return [200, 404].includes(res[0]) && [200, 404].includes(res[1])
          ? of(null)
          : throwError(() => res);
      })
    );
  }

  #navigateSignIn(): void {
    this._snackBar.open('Account created successfully');
    this._router.navigateByUrl('/sign-in');
  }
}
