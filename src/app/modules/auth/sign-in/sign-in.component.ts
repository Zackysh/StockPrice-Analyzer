import { catchError, throwError } from 'rxjs';
import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from 'app/core/user/user.types';

@Component({
  selector: 'auth-sign-in',
  templateUrl: './sign-in.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class AuthSignInComponent implements OnInit {
  @ViewChild('signInNgForm') signInNgForm: NgForm;
  signInForm: FormGroup;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService,
    private _formBuilder: FormBuilder,
    private _router: Router
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.signInForm = this._formBuilder.group({
      credential: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  signIn(): void {
    if (this.signInForm.invalid) {
      return;
    }

    this.signInForm.disable();

    this._authService
      .signIn(this.signInForm.value)
      .pipe(
        catchError((err) => {
          if (err === 401) {
            // wrong password
            this.signInForm.enable();
            const ctrl = this.signInForm.get('password');
            ctrl.setErrors({ ...ctrl.errors, 'wrong-password': true });
          } else if (err === 404) {
            // user not found
            this.signInForm.enable();
            const ctrl = this.signInForm.get('credential');
            ctrl.setErrors({ ...ctrl.errors, 'user-not-found': true });
          }
          return throwError(() => err);
        })
      )
      .subscribe((response) => {
        console.log(response);
        if (response.emailVerified) {
          this._navigateHome();
        } else {
          this._navigateEF();
        }
      });
  }

  _navigateEF(): void {
    // Navigate to the redirect url
    this._router.navigateByUrl('/email-verification');
  }

  _navigateHome(): void {
    const redirectURL =
      this._activatedRoute.snapshot.queryParamMap.get('redirectURL') ||
      '/signed-in-redirect';

    this._router.navigateByUrl(redirectURL);
  }
}
