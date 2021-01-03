import {Injectable} from '@angular/core';
import {Capacitor, Plugins} from '@capacitor/core';
import {AdMobInitializationOptions, AdOptions, AdPosition, AdSize} from '@capacitor-community/admob';
import {environment} from '../../../environments/environment';

const {AdMob, FirebaseRemoteConfig} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class AdsService {

    enabled: boolean;
    platformAdId: { banner: string, interstitial: string }
        = Capacitor.platform === 'android' ? environment.adId.android : environment.adId.ios;
    hasBanner: boolean;
    preparingInterstitial: boolean;

    constructor() {
        this.enabled = Capacitor.isPluginAvailable('AdMob');
    }

    initialize() {
        if (!this.enabled) {
            console.warn('Initialization for AdMob aborted: Plugin not available');
            return;
        }

        if (Capacitor.isPluginAvailable('FirebaseRemoteConfig')) {
            FirebaseRemoteConfig.fetch().then(() => {
                FirebaseRemoteConfig.getBoolean(
                    {
                        key: 'ads_enabled'
                    }
                ).then((fetchedData) => {
                    this.enabled = fetchedData.value;
                });
            });
        }

        console.log('Initializing AdMob');

        AdMob.initialize({
            requestTrackingAuthorization: true,
            testingDevices: ['b785a039328b15576b4382d39429f0bb'],
            initializeForTesting: true,
        } as AdMobInitializationOptions);
    }

    async showBanner() {
        if (!this.enabled) {
            return;
        }

        if (!this.hasBanner) {
            const options: AdOptions = {
                adId: this.platformAdId.banner,
                adSize: AdSize.MEDIUM_RECTANGLE,
                position: AdPosition.BOTTOM_CENTER,
                isTesting: false
                // npa: true
            };

            // Show Banner Ad
            const result = await AdMob.showBanner(options)
                .then(() => {
                    this.hasBanner = true;
                })
                .catch(e => console.log(e));
            if (result === undefined) {
                return;
            }
        } else {
            const result = await AdMob.resumeBanner()
                .catch(e => console.log(e));
            if (result === undefined) {
                return;
            }

        }
    }

    async hideBanner() {
        if (!this.enabled) {
            return;
        }

        const result = await AdMob.hideBanner()
            .catch(e => console.log(e));
        if (result === undefined) {
            return;
        }
    }

    async removeBanner() {
        if (!this.enabled) {
            return;
        }

        const result = await AdMob.removeBanner()
            .catch(e => console.log(e));
        if (result === undefined) {
            return;
        }
    }

    async preloadInterstitial() {
        if (!this.enabled) {
            return;
        }

        const options: AdOptions = {
            adId: this.platformAdId.interstitial,
            adSize: AdSize.LEADERBOARD,
            position: AdPosition.CENTER
        };

        // Prepare interstitial banner
        this.preparingInterstitial = true;
        const result = AdMob.prepareInterstitial(options)
            .catch(e => console.log(e))
            .finally(() => {
                this.preparingInterstitial = false;
            });
        if (result === undefined) {
            return;
        }
    }

    async showInterstitial() {
        if (!this.enabled) {
            return;
        }

        const result = await AdMob.showInterstitial()
            .catch(e => console.log(e));
        if (result === undefined) {
            return;
        }
    }
}
