import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import {
  catchError,
  combineLatest,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'settings-account',
  templateUrl: './account.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsAccountComponent implements OnInit {
  accountForm: FormGroup;
  user: User;

  constructor(
    private _userService: UserService,
    private _authService: AuthService,
    private _formBuilder: FormBuilder,

    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.accountForm = this._formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this._userService.get().subscribe((user) => {
      this.user = user;
      this.accountForm.patchValue(user);
    });
  }

  submit(): void {
    this.accountForm.disable();

    this.#asyncValidation().subscribe(async () => {
      console.log('subscribe');

      if (this.accountForm.invalid) {
        this.accountForm.markAllAsTouched();
        this._changeDetectorRef.markForCheck();
        return;
      }

      if (
        this.user.email !== this.accountForm.value.email &&
        !(await Swal.fire({
          title: 'You are about to update your e-mail.',
          text: 'If you do so, you will have to verify your new e-mail next time you sign-in.',
          icon: 'warning',
          showCancelButton: true,
          cancelButtonColor: '#EF4444',
          // Buttons text
          confirmButtonText: 'Continue',
          cancelButtonText: 'Cancel',
        }).then((result) => result.isConfirmed))
      ) {
        return;
      }

      this._userService.update(this.accountForm.value).subscribe(() => {
        this.user = { ...this.user, ...this.accountForm.value };
        Swal.fire('Profile updated!', '', 'success');
        this.accountForm.enable();
        this._changeDetectorRef.markForCheck();
      });
    });
  }

  #asyncValidation(): Observable<boolean> {
    return combineLatest([
      this.accountForm.value.username === this.user.username
        ? of(404)
        : this._authService
            .checkUser(this.accountForm.value.username)
            .pipe(catchError((err: number) => of(err))),
      this.accountForm.value.email === this.user.email
        ? of(404)
        : this._authService
            .checkUser(this.accountForm.value.email)
            .pipe(catchError((err: number) => of(err))),
    ]).pipe(
      switchMap((res) => {
        if (res[0] === 200) {
          this.accountForm.enable();
          const ctrl = this.accountForm.get('username');
          ctrl.setErrors({ ...ctrl.errors, 'not-available': 'true' });
        }

        if (res[1] === 200) {
          this.accountForm.enable();
          const ctrl = this.accountForm.get('email');
          ctrl.setErrors({ ...ctrl.errors, 'not-available': 'true' });
        }

        this._changeDetectorRef.markForCheck();
        return [200, 404].includes(res[0]) && [200, 404].includes(res[1])
          ? of(null)
          : throwError(() => res);
      })
    );
  }
}
