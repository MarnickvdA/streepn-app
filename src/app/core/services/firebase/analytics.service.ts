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
        this.events.subscribe('auth:logout', (data) => {
            this.logUserLogout(data?.userId || 'unknown_user_id');
            this.setCurrentUser(undefined);
        });
    }

    static isAnalyticsAvailable(): boolean {
        return Capacitor.isPluginAvailable('FirebaseAnalytics') && Capacitor.isNativePlatform() && environment.production;
    }

    setCurrentUser(uid: string) {
        if (AnalyticsService.isAnalyticsAvailable() && uid) {
            FirebaseAnalytics.setUserId({
                userId: uid,
            });
        }
    }

    logUserRegister(uid: string) {
        this.logEvent('user_registered', {
            userId: uid
        });
    }

    logUserLogin(uid: string) {
        this.logEvent('user_login', {
            userId: uid
        });
    }

    logUserLogout(uid: string) {
        this.logEvent('user_logout', {
            userId: uid
        });
    }

    logCreateHouse(uid: string, houseId: string) {
        this.logEvent('house_created', {
            userId: uid,
            houseId
        });
    }

    logJoinHouse(uid: string, houseId: string) {
        this.logEvent('house_joined', {
            userId: uid,
            houseId
        });
    }

    logLeaveHouse(userId: string, houseId: string) {
        this.logEvent('house_left', {
            userId,
            houseId
        });
    }

    logTransaction(uid: string, houseId: string) {
        this.logEvent('transaction_created', {
            userId: uid,
            houseId
        });
    }

    logAddStock(uid: string, houseId: string, stockId: string) {
        this.logEvent('stock_created', {
            userId: uid,
            houseId,
            stockId
        });
    }

    logEditStock(uid: string, houseId: string, stockId: string) {
        this.logEvent('stock_edited', {
            userId: uid,
            houseId,
            stockId
        });
    }

    logRemoveStock(uid: string, houseId: string, stockId: string) {
        this.logEvent('stock_removed', {
            userId: uid,
            houseId,
            stockId
        });
    }

    logEvent(event: string, data: { [key: string]: any }) {
        if (AnalyticsService.isAnalyticsAvailable()) {
            FirebaseAnalytics.logEvent({
                name: event,
                params: data,
            });
        }
    }

    logProfilePhotoChange(userId: string) {
        this.logEvent('profile_picture_changed', {
            userId,
        });
    }
}
