import {Injectable} from '@angular/core';
import '@capacitor-community/firebase-analytics';

import {Capacitor, Plugins} from '@capacitor/core';

const {FirebaseAnalytics} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {

    constructor() {
    }

    setUser(uid: string) {
        if (Capacitor.isNative) {
            FirebaseAnalytics.setUserId({
                userId: uid,
            });
        }
    }

    private logEvent(event: string, data: { [key: string]: any }) {
        if (Capacitor.isNative) {
            FirebaseAnalytics.logEvent({
                name: event,
                params: data,
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

    logTransaction(uid: string, groupId: string, transactionId: string) {
        this.logEvent('transaction_created', {
            userId: uid,
            groupId,
            transactionId
        });
    }
}
