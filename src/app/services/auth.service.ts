import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import firebase from 'firebase/app';
import {Observable} from 'rxjs';
import {EventsService} from './events.service';
import {ResponseSignInWithApplePlugin} from '@capacitor-community/apple-sign-in';
import {Plugins} from '@capacitor/core';
import User = firebase.User;

const {SignInWithApple} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private auth: AngularFireAuth,
                private eventsService: EventsService) {
    }

    register(displayName: string, email: string, password: string) {
        return this.auth.createUserWithEmailAndPassword(email, password)
            .then(data => {
                return this.setDisplayName(data.user, displayName);
            }).then(() => {
                this.eventsService.publish('auth:login');
            })
            .catch(error => {
                const errorCode = error.code;
                const errorMessage = error.message;

                switch (errorCode) {
                    case 'auth/email-already-in-use':
                        break;
                    case 'auth/invalid-email':
                        break;
                    case 'auth/operation-not-allowed':
                        break;
                    case 'auth/weak-password':
                        break;
                }
            });
    }

    login(email: string, password: string) {
        return this.auth.signInWithEmailAndPassword(email, password)
            .then(data => {
                this.eventsService.publish('auth:login');
            })
            .catch(error => {
                console.error(error);

                const errorCode = error.code;
                const errorMessage = error.message;

                switch (errorCode) {
                    case 'auth/invalid-email':
                        // Thrown if the email address is not valid.
                        break;
                    case 'auth/user-disabled':
                        // Thrown if the user corresponding to the given email has been disabled.
                        break;
                    case 'auth/user-not-found':
                        // Thrown if there is no user corresponding to the given email.
                        break;
                    case 'auth/wrong-password':
                        // Thrown if the password is invalid for the given email, or the account corresponding to the
                        // email does not have a password set.
                        break;
                }
            });
    }

    loginWithApple() {
        return SignInWithApple.Authorize()
            .then((response: ResponseSignInWithApplePlugin) => {
                const provider = new firebase.auth.OAuthProvider('apple.com');
                const authCredential = provider.credential({
                    idToken: response.response.identityToken
                });

                return firebase.auth().signInWithCredential(authCredential)
                    .then(data => {
                        const displayName = response.response.givenName;
                        if (displayName) {
                            return this.setDisplayName(data.user, displayName);
                        }
                    }).then(() => {
                        this.eventsService.publish('auth:login');
                    });
            }).catch(err => {
                console.log(err);
            });
    }

    logout() {
        return this.auth.signOut();
    }

    get user(): Observable<User | null> {
        return this.auth.user;
    }

    get currentUser(): Promise<User> {
        return this.auth.currentUser
            .catch(err => {
                this.eventsService.publish('login:error', err);

                return Promise.reject(err);
            });
    }

    private setDisplayName(user: User, displayName: string): Promise<void> {
        return user.updateProfile({
            displayName
        });
    }
}
