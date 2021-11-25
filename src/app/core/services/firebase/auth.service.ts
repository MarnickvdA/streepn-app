import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import {BehaviorSubject, EMPTY, Observable} from 'rxjs';
import {AnalyticsService, EventsService, LoggerService, StorageService} from '@core/services';
import {SignInWithApple, SignInWithAppleResponse} from '@capacitor-community/apple-sign-in';
import {environment} from '@env/environment';
import {catchError} from 'rxjs/operators';
import {AngularFireFunctions} from '@angular/fire/compat/functions';
import {House} from '@core/models';
import User = firebase.User;

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    user: Observable<User | null>;
    currentUser?: User;
    hasAcceptedLegals: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    legalVersion: string;
    private readonly logger = LoggerService.getLogger(AuthService.name);

    constructor(private auth: AngularFireAuth,
                private eventsService: EventsService,
                private storage: StorageService,
                private analytics: AnalyticsService,
                private functions: AngularFireFunctions) {
        this.eventsService.subscribe('auth:login', (userId) => {
            this.analytics.setCurrentUser(userId);
        });

        this.user = this.auth.authState;
        this.user.subscribe(user => {
            this.currentUser = user;

            // For debug purposes when using page reloads which resets the auth state
            if (!environment.production) {
                localStorage.setItem('userId', user?.uid);
            }

            this.analytics.setCurrentUser(user?.uid);
            LoggerService.setUserId(user?.uid);

            user?.getIdToken(true)
                .then(token => {
                    if (token) {
                        // Decode base-64 encoded string and parse it to JSON
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
            .catch(error => Promise.reject(error.code));
    }

    login(email: string, password: string) {
        return this.auth.signInWithEmailAndPassword(email, password)
            .then(data => {
                this.analytics.logUserLogin(data.user.uid);
                this.eventsService.publish('auth:login', {userId: data.user.uid});
            })
            .catch(error => Promise.reject(error.code));
    }

    loginWithApple(): Promise<void> {
        return SignInWithApple.authorize()
            .then((response: SignInWithAppleResponse) => {
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

        return Promise.reject('Unimplemented');
        // return this.googlePlus.login({
        //         webClientId: environment.firebaseConfig.apiKey
        //     })
        //     .then(res => {
        //         const provider = new firebase.auth.OAuthProvider('google.com');
        //         const authCredential = provider.credential({
        //             idToken: res.idToken
        //         });
        //
        //         return firebase.auth().signInWithCredential(authCredential)
        //             .then(data => {
        //                 const displayName = res.displayName;
        //                 const photoUrl = res.imageUrl;
        //                 if (displayName) {
        //                     this.setUserProfile(data.user, displayName, photoUrl);
        //                 }
        //
        //                 return data.user.uid;
        //             }).then((id) => {
        //                 this.eventsService.publish('auth:login', {userId: id});
        //             });
        //     });
    }

    logout() {
        this.eventsService.publish('auth:logout', {userId: this.currentUser.uid});
        return this.auth.signOut();
    }

    setName(newName: string): Promise<void> {
        return this.currentUser.updateProfile({
                displayName: newName
            })
            .catch(err => {
                this.logger.error({
                    message: 'setName failed!',
                    error: err
                });
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

    currentUserIsAdmin(house: House) {
        if (!house || !this.currentUser) {
            return false;
        }

        return house.getUserAccountByUserId(this.currentUser.uid).isAdmin;
    }

    private setUserProfile(user: User, displayName: string, photoUrl?: string): Promise<void> {
        return user.updateProfile({
            displayName,
            photoURL: photoUrl
        });
    }
}
