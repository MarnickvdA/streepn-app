import { __decorate } from "tslib";
import { Component } from '@angular/core';
let LoginPage = class LoginPage {
    constructor(authService) {
        this.authService = authService;
    }
    ngOnInit() {
    }
    login() {
        this.authService.loginWithGoogle()
            .then(value => {
            console.log(value);
        });
    }
};
LoginPage = __decorate([
    Component({
        selector: 'app-login',
        templateUrl: './login.page.html',
        styleUrls: ['./login.page.scss'],
    })
], LoginPage);
export { LoginPage };
//# sourceMappingURL=login.page.js.map