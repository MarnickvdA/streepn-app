import {Component, NgZone} from '@angular/core';

import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {TranslateService} from '@ngx-translate/core';
import {Plugins} from '@capacitor/core';
import {AdMobInitializationOptions} from '@capacitor-community/admob';
import {environment} from '../environments/environment';

const {App, AdMob} = Plugins;

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private translate: TranslateService,
        private zone: NgZone,
    ) {
        this.initializeApp();
    }

    initializeApp() {
        App.addListener('appUrlOpen', (data: any) => {
            this.zone.run(() => {
                // Example url: https://beerswift.app/tabs/tab2
                // slug = /tabs/tab2
                const slug = data.url.split('streepn.nl').pop();

                console.log('appUrlOpen: ' + slug);

                if (slug.startsWith('/group-invite/')) {
                    const groupCode = slug.split('/group-invite/').pop();

                    window.localStorage.setItem('groupInvite', groupCode);

                    console.log('Group code: ' + groupCode);
                }
                // If no match, do nothing - let regular routing
                // logic take over
            });
        });

        this.platform.ready().then(() => {
            this.translate.setDefaultLang('en_GB');
            this.translate.use('nl_NL');

            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

            // Listen for changes to the prefers-color-scheme media query
            prefersDark.addEventListener('change', (mediaQuery: MediaQueryListEvent) => this.toggleDarkTheme(mediaQuery.matches));
            this.toggleDarkTheme(window.localStorage.getItem('darkMode') === 'true' || prefersDark.matches);

            AdMob.initialize({
                requestTrackingAuthorization: true,
                testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'],
                initializeForTesting: !environment.production,
            } as AdMobInitializationOptions);

            this.statusBar.styleDefault();
            this.splashScreen.hide();
        });
    }

    private toggleDarkTheme(isDarkMode: boolean) {
        window.localStorage.setItem('darkMode', `${isDarkMode}`);
        document.body.classList.toggle('dark', isDarkMode);
    }
}
