import { Route } from '@angular/router';
import { AuthCheckRestorePasswordComponent } from './check-restore-password.component';

export const authCheckForgotPasswordRoutes: Route[] = [
    {
        path     : '',
        component: AuthCheckRestorePasswordComponent
    }
];
