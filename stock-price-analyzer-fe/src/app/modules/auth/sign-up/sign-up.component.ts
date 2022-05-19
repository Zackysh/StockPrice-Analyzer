import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { FormHelper } from 'app/shared/form.helper';
import { combineLatest, Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'auth-sign-up',
  templateUrl: './sign-up.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class AuthSignUpComponent implements OnInit {
  @ViewChild('signUpNgForm') signUpNgForm: NgForm;

  signUpForm: FormGroup;

  constructor(
    private _userService: UserService,
    private _authService: AuthService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _formHelper: FormHelper,
    private _snackBar: MatSnackBar
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    // if access token ramains in localStorage,
    // checkUsername | checkEmail will not work as expected
    this._authService.signOut();

    this.signUpForm = this._formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      provinceId: ['', Validators.required],
      languageId: ['', Validators.required],
      location: ['', Validators.required],
      address: ['', Validators.required],
      companyName: ['', Validators.required],
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
        switchMap((res) =>
          res ? this._authService.signUp(this.signUpForm.value) : of(null)
        )
      )
      .subscribe((response) => {
        if (response?.user?.companyId) {
          this.#navigateSignIn();
        }
      });
  }

  #asyncValidation(): Observable<boolean> {
    return combineLatest([
      this._authService.checkEmail(this.signUpForm.value.email),
      this._authService.checkUsername(this.signUpForm.value.username),
    ]).pipe(
      switchMap((res) => {
        if (!res[0]) {
          this.signUpForm.enable();
          const ctrl = this.signUpForm.get('email');
          ctrl.setErrors({ ...ctrl.errors, 'not-available': 'true' });
        }
        if (!res[1]) {
          this.signUpForm.enable();
          const ctrl = this.signUpForm.get('username');
          ctrl.setErrors({ ...ctrl.errors, 'not-available': 'true' });
        }
        return of(res[0] && res[1]);
      })
    );
  }

  #navigateSignIn(): void {
    this._snackBar.open('Account created successfully');
    // Navigate to the redirect url
    this._router.navigateByUrl('/sign-in');
  }
}
