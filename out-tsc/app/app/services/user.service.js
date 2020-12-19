import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
let UserService = class UserService {
    constructor(authService) {
        this.authService = authService;
    }
    setName(newName) {
        this.authService.currentUser
            .then(user => {
            user.updateProfile({
                displayName: newName
            })
                .catch(err => {
                // TODO Error handling
            });
        });
    }
};
UserService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], UserService);
export { UserService };
//# sourceMappingURL=user.service.js.map