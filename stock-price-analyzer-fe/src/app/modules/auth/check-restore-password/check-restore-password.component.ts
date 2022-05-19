import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'auth-check-restore-password',
  templateUrl: './check-restore-password.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class AuthCheckRestorePasswordComponent implements OnInit, OnDestroy {
  @ViewChild('checkRestorePasswordForm') checkRestorePasswordNgForm: NgForm;

  checkRestorePasswordForm: FormGroup;
  showAlert: boolean = false;
  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };

  _unsubscribeAll: Subject<any> = new Subject<any>();
  _credential: string;

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
    this.checkRestorePasswordForm = this._formBuilder.group({
      code: ['', [Validators.required, Validators.maxLength(6)]],
    });

    this._route.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((params) => {
        this._credential = params['credential'];

        this.sendRestoreCode();
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  sendRestoreCode(): void {
    this._authService.sendRestorePasswordCode(this._credential).subscribe();
  }

  checkResetCode(): void {
    if (this.checkRestorePasswordForm.invalid) {
      return;
    }

    this.checkRestorePasswordForm.disable();
    this.showAlert = false;

    this._authService
      .checkRestorePasswordCode(
        this._credential,
        this.checkRestorePasswordForm.get('code').value
      )
      .subscribe((res) => {
        if (res) {
          this._router.navigate([
            '/reset-password',
            {
              code: this.checkRestorePasswordForm.get('code').value,
              credential: this._credential,
            },
          ]);
        } else {
          this.checkRestorePasswordForm.enable();
          this.alert = {
            type: 'error',
            message: 'Wrong reset password ode',
          };
          this.showAlert = true;
        }
      });
  }
}
