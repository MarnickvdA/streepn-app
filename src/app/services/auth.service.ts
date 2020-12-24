import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import firebase from 'firebase/app';
import {Observable} from 'rxjs';
import {EventsService} from './events.service';
import {ResponseSignInWithApplePlugin} from '@capacitor-community/apple-sign-in';
import {Plugins} from '@capacitor/core';
import {StorageService} from './storage.service';
import User = firebase.User;

const {SignInWithApple} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private auth: AngularFireAuth,
                private eventsService: EventsService,
                private storage: StorageService) {
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

                return Promise.reject(errorCode);
            });
    }

    login(email: string, password: string) {
        return this.auth.signInWithEmailAndPassword(email, password)
            .then(data => {
                this.eventsService.publish('auth:login');
            })
            .catch(error => {
                const errorCode = error.code;
                const errorMessage = error.message;

                return Promise.reject(errorCode);
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
        this.storage.nuke();
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
