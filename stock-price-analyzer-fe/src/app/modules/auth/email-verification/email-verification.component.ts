import { Subject, take, takeUntil } from 'rxjs';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';

@Component({
  selector: 'auth-email-verification',
  templateUrl: './email-verification.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class EmailVerificationComponent implements OnInit {
  mailCodeForm: FormGroup;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    private _userService: UserService,
    private _activatedRoute: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.mailCodeForm = this._formBuilder.group({
      mailCode: ['', [Validators.required]],
    });

    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user) => {
        if (user.emailVerified) {
          this._unsubscribeAll.next(null);
          this._unsubscribeAll.complete();
          this._navigateHome();
        } else {
          this.sendMailCode();
        }
      });
  }

  submit(): void {
    if (this.mailCodeForm.invalid) {
      return;
    }

    this.mailCodeForm.disable();
    this._authService
      .emailVerification(
        this._authService.accessToken,
        this.mailCodeForm.value.mailCode
      )
      .pipe(take(1))
      .subscribe((res) => {
        if (res) {
          this._snackBar.open('Email verified successfully', null, {
            duration: 8000,
          });
          this._navigateHome();
        } else {
          this.mailCodeForm.enable();
          const ctrl = this.mailCodeForm.get('mailCode');
          ctrl.setErrors({ ...ctrl.errors, invalid: true });
        }
      });
  }

  sendMailCode(): void {
    this._snackBar.open('Verification code sent', null, { duration: 4000 });
    this._authService.sendMailVerificationCode().subscribe();
  }

  _navigateHome(): void {
    const redirectURL =
      this._activatedRoute.snapshot.queryParamMap.get('redirectURL') ||
      '/signed-in-redirect';

    // Navigate to the redirect url
    this._router.navigateByUrl(redirectURL);
  }
}
