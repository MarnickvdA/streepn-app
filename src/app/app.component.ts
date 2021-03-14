import {Component, NgZone} from '@angular/core';

import {MenuController, NavController, Platform} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {AppState, Capacitor, Plugins, StatusBarStyle} from '@capacitor/core';
import {StorageService} from '@core/services/storage.service';
import {EventsService} from '@core/services/events.service';
import {PushService} from '@core/services/push.service';
import {NavigationEnd, Router} from '@angular/router';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {
    faAdjust,
    faAt,
    faBars,
    faBell,
    faBoxFull,
    faCalculatorAlt,
    faCheckCircle,
    faChevronLeft,
    faClock,
    faCogs,
    faEdit,
    faHistory,
    faHouse,
    faInfoCircle,
    faInventory, faList,
    faMinusCircle,
    faPlusCircle,
    faReceipt,
    faShareAltSquare,
    faSignOut,
    faTag,
    faTicket,
    faTimes,
    faTimesCircle,
    faTrashAlt,
    faUser, faUserCog,
    faUsersCrown,
    faWallet
} from '@fortawesome/pro-duotone-svg-icons';
import {faPlus, faShoppingCart} from '@fortawesome/pro-regular-svg-icons';
import {faStar} from '@fortawesome/pro-light-svg-icons';
import {faStar as faStarSolid} from '@fortawesome/pro-solid-svg-icons';

const {App, StatusBar, SplashScreen, FirebaseRemoteConfig} = Plugins;

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    showSideMenu = false;

    constructor(
        private platform: Platform,
        private translate: TranslateService,
        private zone: NgZone,
        private storage: StorageService,
        private events: EventsService,
        private pushService: PushService,
        private router: Router,
        public menuCtrl: MenuController,
        private iconLibrary: FaIconLibrary,
        private navController: NavController
    ) {
        this.initializeApp();

        this.loadIcons();

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

                if (slug.startsWith('/house-invite/')) {
                    const houseCode = slug.split('/house-invite/').pop();

                    this.storage.set('houseInvite', houseCode);
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

            SplashScreen.hide();

            this.storage.get('favorite')
                .then((favorite: string) => {
                    this.navController.navigateRoot('house/' + favorite + '/home');
                })
                .catch(() => {
                });
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

    private loadIcons() {
        this.iconLibrary.addIcons(
            faBars,
            faChevronLeft,
            faTimes,
            faTimesCircle,
            faPlus,
            faMinusCircle,
            faInfoCircle,
            faUser,
            faBell,
            faUsersCrown,
            faWallet,
            faPlusCircle,
            faMinusCircle,
            faSignOut,
            faCalculatorAlt,
            faClock,
            faTicket,
            faPlus,
            faHouse,
            faReceipt,
            faInventory,
            faCogs,
            faShoppingCart,
            faShareAltSquare,
            faCheckCircle,
            faEdit,
            faHistory,
            faTag,
            faTrashAlt,
            faBoxFull,
            faUser,
            faAt,
            faList,
            faUserCog,
            faAdjust,
            faStar,
            faStarSolid
        );
    }
}
