import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FuseCardModule } from '@fuse/components/card';
import { SharedModule } from 'app/shared/shared.module';
import { EmailVerificationComponent } from 'app/modules/auth/email-verification/email-verification.component';
import { authConfirmationRequiredRoutes } from 'app/modules/auth/email-verification/email-verification.routing';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [EmailVerificationComponent],
  imports: [
    RouterModule.forChild(authConfirmationRequiredRoutes),
    MatButtonModule,
    MatInputModule,
    FuseCardModule,
    SharedModule,
  ],
})
export class AuthConfirmationRequiredModule {}
