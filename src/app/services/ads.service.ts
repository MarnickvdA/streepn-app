import {Injectable} from '@angular/core';
import {Capacitor, Plugins} from '@capacitor/core';
import {AdMobInitializationOptions} from '@capacitor-community/admob';
import {environment} from '../../environments/environment';

const {AdMob} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class AdsService {

    constructor() {
    }

    initialize() {
        if (!Capacitor.isPluginAvailable('AdMob')) {
            return;
        }

        AdMob.initialize({
            requestTrackingAuthorization: true,
            testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'],
            initializeForTesting: !environment.production,
        } as AdMobInitializationOptions);
    }
}
