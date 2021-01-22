import {Injectable} from '@angular/core';
import '@capacitor-community/firebase-analytics';

import {Capacitor, Plugins} from '@capacitor/core';
import {environment} from '@env/environment';
import {EventsService} from '@core/services/events.service';

const {FirebaseAnalytics} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {

    constructor(private events: EventsService) {
        this.events.subscribe('auth:logout', (data) => {
            this.logUserLogout(data.userId);
            this.setCurrentUser(undefined);
        });
    }

    static isAnalyticsAvailable(): boolean {
        return Capacitor.isPluginAvailable('FirebaseAnalytics') && Capacitor.isNative && environment.production;
    }

    setCurrentUser(uid: string) {
        if (AnalyticsService.isAnalyticsAvailable()) {
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

    logCreateGroup(uid: string, groupId: string) {
        this.logEvent('group_created', {
            userId: uid,
            groupId
        });
    }

    logJoinGroup(uid: string, groupId: string) {
        this.logEvent('group_joined', {
            userId: uid,
            groupId
        });
    }

    logLeaveGroup(userId: string, groupId: string) {
        this.logEvent('group_left', {
            userId,
            groupId
        });
    }

    logTransaction(uid: string, groupId: string, transactionId: string) {
        this.logEvent('transaction_created', {
            userId: uid,
            groupId,
            transactionId
        });
    }

    logAddStock(uid: string, groupId: string, stockId: string) {
        this.logEvent('stock_created', {
            userId: uid,
            groupId,
            stockId
        });
    }

    logEditStock(uid: string, groupId: string, stockId: string) {
        this.logEvent('stock_edited', {
            userId: uid,
            groupId,
            stockId
        });
    }

    logRemoveStock(uid: string, groupId: string, stockId: string) {
        this.logEvent('stock_removed', {
            userId: uid,
            groupId,
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
}
