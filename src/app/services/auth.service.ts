import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import firebase from 'firebase/app';
import {Observable} from 'rxjs';
import {EventsService} from './events.service';
import {ResponseSignInWithApplePlugin} from '@capacitor-community/apple-sign-in';
import {Plugins} from '@capacitor/core';
import {StorageService} from './storage.service';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {environment} from '../../environments/environment';
import User = firebase.User;

const {SignInWithApple} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private auth: AngularFireAuth,
                private eventsService: EventsService,
                private storage: StorageService,
                private googlePlus: GooglePlus) {
    }

    register(displayName: string, email: string, password: string) {
        return this.auth.createUserWithEmailAndPassword(email, password)
            .then(data => {
                return this.setUserProfile(data.user, displayName);
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

    loginWithApple(): Promise<void> {
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
                            return this.setUserProfile(data.user, displayName);
                        }
                    }).then(() => {
                        this.eventsService.publish('auth:login');
                    });
            });
    }

    loginWithGoogle(): Promise<void> {
        // TODO Google re-signs your app with a different certificate when you publish it in the Play Store. Once your app is published,
        // copy the SHA-1 fingerprint of the "App signing certificate", found in the "App signing" section under "Release Management",
        // in Google Play Console. Paste this fingerprint in the Release OAuth client ID in Google Credentials Manager.

        return this.googlePlus.login({
                webClientId: environment.firebaseConfig.apiKey
            })
            .then(res => {
                const provider = new firebase.auth.OAuthProvider('google.com');
                const authCredential = provider.credential({
                    idToken: res.idToken
                });

                return firebase.auth().signInWithCredential(authCredential)
                    .then(data => {
                        const displayName = res.displayName;
                        const photoUrl = res.imageUrl;
                        if (displayName) {
                            return this.setUserProfile(data.user, displayName, photoUrl);
                        }
                    }).then(() => {
                        this.eventsService.publish('auth:login');
                    });
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

    private setUserProfile(user: User, displayName: string, photoUrl?: string): Promise<void> {
        return user.updateProfile({
            displayName,
            photoURL: photoUrl
        });
    }
}
