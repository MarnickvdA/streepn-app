import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import firebase from 'firebase/app';
import {BehaviorSubject, EMPTY, Observable} from 'rxjs';
import {EventsService} from './events.service';
import {ResponseSignInWithApplePlugin} from '@capacitor-community/apple-sign-in';
import {Plugins} from '@capacitor/core';
import {StorageService} from './storage.service';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {environment} from '../../environments/environment';
import {AnalyticsService} from './analytics.service';
import {catchError} from 'rxjs/operators';
import {AngularFireFunctions} from '@angular/fire/functions';
import {LoggerService} from './logger.service';
import User = firebase.User;

const {SignInWithApple} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly logger = LoggerService.getLogger(AuthService.name);

    currentUser?: User;
    hasAcceptedLegals: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    legalVersion: string;

    constructor(private auth: AngularFireAuth,
                private eventsService: EventsService,
                private storage: StorageService,
                private googlePlus: GooglePlus,
                private analytics: AnalyticsService,
                private functions: AngularFireFunctions) {
        this.eventsService.subscribe('auth:login', (userId) => {
            this.analytics.setUser(userId);
        });

        this.auth.user
            .subscribe(user => {
                this.currentUser = user;

                if (user) {
                    user.getIdToken(true)
                        .then(token => {
                            if (token) {
                                const payload = JSON.parse(atob(token.split('.')[1]));

                                this.hasAcceptedLegals.next(payload.acceptedTermsAndPrivacy);
                                this.legalVersion = payload.termsAndPrivacyVersion;
                            } else {
                                this.logger.error({message: 'Could not retrieve token'});
                            }
                        })
                        .catch(err => {
                            this.logger.error({message: 'getIdToken error', error: err});
                        });
                }
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

                this.logger.error({
                    message: errorMessage,
                    error
                });

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

                this.logger.error({
                    message: errorMessage,
                    error
                });

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
        this.analytics.logUserLogout(this.currentUser.uid);
        this.analytics.setUser(undefined);
        this.storage.nuke();
        return this.auth.signOut();
    }

    get user(): Observable<User | null> {
        return this.auth.user;
    }

    setName(newName: string): Promise<void> {
        return this.currentUser.updateProfile({
                displayName: newName
            })
            .catch(err => {
                // TODO Error handling
            });
    }

    acceptTerms() {
        const callable = this.functions.httpsCallable('acceptTerms');
        callable({version: environment.legalVersion})
            .pipe(catchError((err) => {
                this.logger.error({message: 'acceptTerms', error: err});
                return EMPTY;
            }))
            .subscribe(data => {
                if (data) {
                    this.eventsService.publish('legal:result', true);
                } else {
                    this.eventsService.publish('legal:result', false);
                }
            });
    }

    private setUserProfile(user: User, displayName: string, photoUrl?: string): Promise<void> {
        return user.updateProfile({
            displayName,
            photoURL: photoUrl
        });
    }
}
