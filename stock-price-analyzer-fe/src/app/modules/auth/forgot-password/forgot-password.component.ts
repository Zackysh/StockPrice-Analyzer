import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'auth-forgot-password',
  templateUrl: './forgot-password.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class AuthForgotPasswordComponent implements OnInit {
  @ViewChild('forgotPasswordNgForm') forgotPasswordNgForm: NgForm;

  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };
  forgotPasswordForm: FormGroup;
  showAlert: boolean = false;

  /**
   * Constructor
   */
  constructor(
    private _authService: AuthService,
    private _formBuilder: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _router: Router
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    // Create the form
    this.forgotPasswordForm = this._formBuilder.group({
      credential: ['', Validators.required],
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  checkCredential(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.forgotPasswordForm.disable();
    this.showAlert = false;

    this._authService
      .checkCredential(this.forgotPasswordForm.get('credential').value)
      .pipe(
        finalize(() => {
          this.forgotPasswordForm.enable();
          this.forgotPasswordNgForm.resetForm();
          this.showAlert = true;
        })
      )
      .subscribe((response) => {
        if (!response) {
          this._router.navigate([
            '/check-restore-password',
            this.forgotPasswordForm.get('credential').value,
          ]);
        } else {
          this.alert = {
            type: 'error',
            message: 'User not found with provided credentials',
          };
        }
      });
  }
}
