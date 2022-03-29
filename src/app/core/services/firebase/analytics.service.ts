import {Injectable} from '@angular/core';
import '@capacitor-community/firebase-analytics';

import {Capacitor} from '@capacitor/core';
import {environment} from '@env/environment';
import {EventsService} from '@core/services/events.service';
import {FirebaseAnalytics} from '@capacitor-community/firebase-analytics';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {

    constructor(private events: EventsService) {
        this.events.subscribe('auth:logout', () => {
            this.logUserLogout();
        });
    }

    static isAnalyticsAvailable(): boolean {
        return Capacitor.isPluginAvailable('FirebaseAnalytics') && Capacitor.isNativePlatform() && environment.production;
    }

    logUserRegister() {
        this.logEvent('user_registered');
    }

    logUserLogin() {
        this.logEvent('user_login');
    }

    logUserLogout() {
        this.logEvent('user_logout');
    }

    logCreateHouse(houseId: string) {
        this.logEvent('house_created', {
            houseId
        });
    }

    logJoinHouse(houseId: string) {
        this.logEvent('house_joined', {
            houseId
        });
    }

    logLeaveHouse(houseId: string) {
        this.logEvent('house_left', {
            houseId
        });
    }

    logTransaction(houseId: string) {
        this.logEvent('transaction_created', {
            houseId
        });
    }

    logAddStock(houseId: string, stockId: string) {
        this.logEvent('stock_created', {
            houseId,
            stockId
        });
    }

    logDealsPageView() {
        this.logEvent('view_deals_page');
    }

    logClickDeal(dealsId: string) {
        this.logEvent('deals_click', {
            deals_id: dealsId
        });
    }

    logProfilePhotoChange() {
        this.logEvent('profile_picture_changed');
    }

    logEvent(event: string, data?: { [key: string]: any }) {
        if (AnalyticsService.isAnalyticsAvailable()) {
            let options = {
                name: event,
                params: data,
            };

            Object.keys(options).forEach(key => {
                if (options[key] === undefined) {
                    delete options[key];
                }
            });

            FirebaseAnalytics.logEvent(options);
        }
    }
}
