import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule } from '@angular/router';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['dashboard']);
const routes = [
    {
        path: '',
    },
    Object.assign({ path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule) }, canActivate(redirectLoggedInToDashboard)),
    Object.assign({ path: 'group', loadChildren: () => import('./pages/group/group.module').then(m => m.GroupPageModule) }, canActivate(redirectUnauthorizedToLogin)),
    Object.assign({ path: 'dashboard', loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule) }, canActivate(redirectUnauthorizedToLogin))
];
let AppRoutingModule = class AppRoutingModule {
};
AppRoutingModule = __decorate([
    NgModule({
        imports: [
            RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
        ],
        exports: [RouterModule]
    })
], AppRoutingModule);
export { AppRoutingModule };
//# sourceMappingURL=app-routing.module.js.map