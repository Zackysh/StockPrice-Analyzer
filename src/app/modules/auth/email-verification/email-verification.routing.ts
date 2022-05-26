import { Route } from '@angular/router';
import { EmailVerificationComponent } from 'app/modules/auth/email-verification/email-verification.component';

export const authConfirmationRequiredRoutes: Route[] = [
    {
        path     : '',
        component: EmailVerificationComponent
    }
];
