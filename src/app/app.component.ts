import {Component, NgZone} from '@angular/core';
import {MenuController, Platform} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {StorageService} from '@core/services/storage.service';
import {EventsService} from '@core/services/events.service';
import {PushService} from '@core/services/firebase/push.service';
import {NavigationEnd, Router} from '@angular/router';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {App, AppState} from '@capacitor/app';
import {SplashScreen} from '@capacitor/splash-screen';
import {StatusBar, Style} from '@capacitor/status-bar';
import {Storage} from '@capacitor/storage';
import {Capacitor} from '@capacitor/core';
import {environment} from '@env/environment';
import {AngularFireStorage} from '@angular/fire/storage';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    hideSideMenu = false;

    constructor(
        private platform: Platform,
        private translate: TranslateService,
        private zone: NgZone,
        private storage: StorageService,
        private afStorage: AngularFireStorage,
        private events: EventsService,
        private pushService: PushService,
        private router: Router,
        public menuCtrl: MenuController,
    ) {
        Storage.migrate();

        if (!environment.production) {
            this.afStorage.storage.useEmulator('localhost', 9199);
        }

        this.initializeApp();

        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.hideSideMenu = val.urlAfterRedirects.startsWith('/login')
                    || val.urlAfterRedirects.startsWith('/register');
            }
        });
    }

    initializeApp() {
        App.addListener('appUrlOpen', (data: any) => {
            this.zone.run(() => {
                const slug = data.url.split('streepn.nl').pop();

                if (slug.startsWith('/house-invite/')) {
                    const houseCode = slug.split('/house-invite/').pop();

                    this.storage.set('houseInvite', houseCode);
                }

                if (slug.startsWith('/auth/action')) {
                    const queryParams = new URL(data.url).searchParams;
                    const mode = queryParams.get('mode');
                    const oobCode = queryParams.get('oobCode');

                    switch (mode) {
                        case 'resetPassword':
                            this.storage.set('passwordResetCode', oobCode);
                            break;
                        case 'recoverEmail':
                            break;
                        case 'verifyEmail':
                            break;
                    }
                }
            });
        });

        this.platform.ready().then(() => {
            this.initTranslations();
            // this.initDarkMode();
            this.pushService.removeNotifications();

            App.addListener('appStateChange', (state: AppState) => {
                // state.isActive contains the active state
                if (state.isActive) {
                    this.events.publish('app:resume');
                } else {
                    this.events.publish('app:pause');
                }
            });

            SplashScreen.hide();
        });
    }

    toggleMenu(isEnabled: boolean) {
        this.menuCtrl.swipeGesture(isEnabled);
    }

    private initTranslations() {
        this.translate.setDefaultLang('en_GB');
        this.translate.use('nl_NL');
    }

    private initDarkMode() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

        // Listen for changes to the prefers-color-scheme media query
        prefersDark.addEventListener('change', (mediaQuery: MediaQueryListEvent) => this.toggleDarkTheme(mediaQuery.matches));
        this.storage.get('darkMode')
            .then((darkMode: boolean) => {
                this.toggleDarkTheme(darkMode);
            })
            .catch(() => {
                this.toggleDarkTheme(prefersDark.matches);
            });
    }

    private toggleDarkTheme(isDarkMode: boolean) {
        this.storage.set('darkMode', isDarkMode);
        document.body.classList.toggle('dark', isDarkMode);

        if (Capacitor.isPluginAvailable('StatusBar')) {
            StatusBar.setStyle({
                style: isDarkMode ? Style.Dark : Style.Light
            });

            if (Capacitor.getPlatform() === 'android') {
                if (isDarkMode) {
                    StatusBar.setBackgroundColor({color: '#000000'});
                } else {
                    StatusBar.setBackgroundColor({color: '#FFFFFF'});
                }
            }
        }
    }
}
