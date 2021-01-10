import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {canActivate, redirectLoggedInTo, redirectUnauthorizedTo} from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['dashboard']);

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
    },
    {
        path: 'login',
        loadChildren: () => import('./modules/login/login.module').then(m => m.LoginPageModule),
        ...canActivate(redirectLoggedInToDashboard)
    },
    {
        path: 'register',
        loadChildren: () => import('./modules/register/register.module').then(m => m.RegisterPageModule),
        ...canActivate(redirectLoggedInToDashboard)
    },
    {
        path: 'group',
        loadChildren: () => import('./modules/group/group.module').then(m => m.GroupPageModule),
        ...canActivate(redirectUnauthorizedToLogin)
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardPageModule),
        ...canActivate(redirectUnauthorizedToLogin)
    },
    {
        path: 'profile',
        loadChildren: () => import('./modules/profile/profile.module').then(m => m.ProfilePageModule),
        ...canActivate(redirectUnauthorizedToLogin)
    },
    {
        path: '**',
        redirectTo: 'login',
        pathMatch: 'full'
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            preloadingStrategy: PreloadAllModules,
            // enableTracing: true // debug purposes
        })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
