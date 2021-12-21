import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {LoginPage} from './login.page';
import {PasswordResetPage} from '@modules/login/password-reset/password-reset.page';

const routes: Routes = [
    {
        path: '',
        component: LoginPage
    },
    {
        path: 'reset-password',
        component: PasswordResetPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LoginPageRoutingModule {
}
