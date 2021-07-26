import {Component, NgZone} from '@angular/core';

import {MenuController, NavController, Platform} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {StorageService} from '@core/services/storage.service';
import {EventsService} from '@core/services/events.service';
import {PushService} from '@core/services/firebase/push.service';
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
    faDollyFlatbedAlt,
    faEdit,
    faGifts,
    faHistory,
    faHouse,
    faInfoCircle,
    faInventory,
    faList,
    faMinusCircle,
    faPlus as fadPlus,
    faPlusCircle,
    faReceipt,
    faSack,
    faShareAltSquare,
    faSignOut,
    faTag,
    faTicket,
    faTimes,
    faTimesCircle,
    faTrashAlt,
    faUser,
    faUserCog,
    faUsersCrown,
    faWallet
} from '@fortawesome/pro-duotone-svg-icons';
import {faPlus, faShoppingCart} from '@fortawesome/pro-regular-svg-icons';
import {faStar} from '@fortawesome/pro-light-svg-icons';
import {faStar as faStarSolid} from '@fortawesome/pro-solid-svg-icons';
import {App, AppState} from '@capacitor/app';
import {SplashScreen} from '@capacitor/splash-screen';
import {StatusBar, Style} from '@capacitor/status-bar';
import {Storage} from '@capacitor/storage';
import {Capacitor} from '@capacitor/core';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    hideSideMenu = true;

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
        Storage.migrate();

        this.initializeApp();

        this.loadIcons();

        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.hideSideMenu = val.url.startsWith('/login')
                    || val.url.startsWith('/register')
                    || val.urlAfterRedirects.startsWith('/login')
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
                    this.pushService.requestPermissionsIfNotPromptedYet();
                    this.events.publish('app:resume');
                } else {
                    this.events.publish('app:pause');
                }
            });

            this.pushService.removeNotifications();

            // if (Capacitor.isPluginAvailable('FirebaseRemoteConfig')) {
            //     FirebaseRemoteConfig.initialize({
            //         minimumFetchInterval: (60 * 12),
            //     });
            //     FirebaseRemoteConfig.fetchAndActivate();
            // }

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
            faStarSolid,
            faDollyFlatbedAlt,
            fadPlus,
            faGifts,
            faSack,
        );
    }
}
