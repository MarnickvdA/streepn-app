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
import {AnalyticsService} from './analytics.service';
import User = firebase.User;

const {SignInWithApple} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private authUser?: User;

    constructor(private auth: AngularFireAuth,
                private eventsService: EventsService,
                private storage: StorageService,
                private googlePlus: GooglePlus,
                private analytics: AnalyticsService) {
        this.eventsService.subscribe('auth:login', (userId) => {
            this.analytics.setUser(userId);
        });

        this.user
            .subscribe(user => {
                this.authUser = user;
            });
    }

    register(displayName: string, email: string, password: string) {
        return this.auth.createUserWithEmailAndPassword(email, password)
            .then(data => {
                this.analytics.logUserRegister(data.user.uid);
                this.setUserProfile(data.user, displayName);

                return data.user.uid;
            }).then((id) => {
                this.eventsService.publish('auth:login', {userId: id});
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
                this.analytics.logUserLogin(data.user.uid);
                this.eventsService.publish('auth:login', {userId: data.user.uid});
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
                            this.setUserProfile(data.user, displayName);
                        }

                        return data.user.uid;
                    }).then((id) => {
                        this.eventsService.publish('auth:login', {userId: id});
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
                            this.setUserProfile(data.user, displayName, photoUrl);
                        }

                        return data.user.uid;
                    }).then((id) => {
                        this.eventsService.publish('auth:login', {userId: id});
                    });
            });
    }

    logout() {
        this.analytics.logUserLogout(this.authUser.uid);
        this.analytics.setUser(undefined);
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
