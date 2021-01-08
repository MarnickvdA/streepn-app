import {Component, NgZone} from '@angular/core';

import {MenuController, Platform} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {AppState, Capacitor, Plugins, StatusBarStyle} from '@capacitor/core';
import {AdsService} from '@core/services/ads.service';
import {StorageService} from '@core/services/storage.service';
import {EventsService} from '@core/services/events.service';
import {PushService} from '@core/services/push.service';
import {NavigationEnd, Router} from '@angular/router';

const {App, StatusBar, SplashScreen, FirebaseRemoteConfig} = Plugins;

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    showSideMenu: boolean;

    constructor(
        private platform: Platform,
        private translate: TranslateService,
        private zone: NgZone,
        private adsService: AdsService,
        private storage: StorageService,
        private events: EventsService,
        private pushService: PushService,
        private router: Router,
        public menuCtrl: MenuController
    ) {
        this.initializeApp();

        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.showSideMenu = !val.url.startsWith('/login') && !val.url.startsWith('/register');
            }
        });
    }

    initializeApp() {
        App.addListener('appUrlOpen', (data: any) => {
            this.zone.run(() => {
                const slug = data.url.split('streepn.nl').pop();

                if (slug.startsWith('/group-invite/')) {
                    const groupCode = slug.split('/group-invite/').pop();

                    this.storage.set('groupInvite', groupCode);
                }
            });
        });

        this.platform.ready().then(() => {
            this.translate.setDefaultLang('en_GB');
            this.translate.use('nl_NL');

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

            App.addListener('appStateChange', (state: AppState) => {
                // state.isActive contains the active state
                if (state.isActive) {
                    this.events.publish('app:resume');
                } else {
                    this.events.publish('app:pause');
                }
            });

            this.pushService.removeNotifications();

            if (Capacitor.isPluginAvailable('FirebaseRemoteConfig')) {
                FirebaseRemoteConfig.initialize({
                    minimumFetchIntervalInSeconds: (60 * 12),
                });
                FirebaseRemoteConfig.fetchAndActivate();
            }

            this.adsService.initialize();

            SplashScreen.hide();
        });
    }

    private toggleDarkTheme(isDarkMode: boolean) {
        this.storage.set('darkMode', isDarkMode);
        document.body.classList.toggle('dark', isDarkMode);

        if (Capacitor.isPluginAvailable('StatusBar')) {
            StatusBar.setStyle({
                style: isDarkMode ? StatusBarStyle.Dark : StatusBarStyle.Light
            });

            if (isDarkMode) {
                StatusBar.setBackgroundColor({color: '#000000'});
            } else {
                StatusBar.setBackgroundColor({color: '#FFFFFF'});
            }
        }
    }
}
