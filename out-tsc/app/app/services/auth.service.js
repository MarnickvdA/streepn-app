import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import firebase from 'firebase';
var GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
let AuthService = class AuthService {
    constructor(auth, eventsService) {
        this.auth = auth;
        this.eventsService = eventsService;
    }
    loginWithGoogle() {
        // TODO: Error handling
        return this.auth.signInWithPopup(new GoogleAuthProvider());
    }
    loginWithApple() {
        // FIXME: unimplemented
        return Promise.reject();
    }
    logout() {
        return this.auth.signOut();
    }
    get user() {
        return this.auth.user;
    }
    get currentUser() {
        return this.auth.currentUser
            .catch(err => {
            this.eventsService.publish('login:error', err);
            return Promise.reject(err);
        });
    }
};
AuthService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map