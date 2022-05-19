import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { FuseValidators } from '@fuse/validators';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'auth-reset-password',
  templateUrl: './reset-password.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class AuthResetPasswordComponent implements OnInit, OnDestroy {
  @ViewChild('resetPasswordNgForm') resetPasswordNgForm: NgForm;

  resetPasswordForm: FormGroup;
  showAlert: boolean = false;
  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };

  _unsubscribeAll: Subject<any> = new Subject<any>();
  _credential: string;
  _code: string;

  constructor(
    private _authService: AuthService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.resetPasswordForm = this._formBuilder.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirm: ['', [Validators.required, Validators.minLength(6)]],
      },
      {
        validators: FuseValidators.mustMatch('password', 'passwordConfirm'),
      }
    );

    this._route.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((params) => {
        this._credential = params['credential'];
        this._code = params['code'];
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  resetPassword(): void {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.resetPasswordForm.disable();
    this.showAlert = false;

    this._authService
      .resetPassword(
        this._credential,
        this.resetPasswordForm.get('password').value,
        this._code
      )
      .subscribe();

    this._authService.signOut();
    this._router.navigateByUrl('/');
  }
}
