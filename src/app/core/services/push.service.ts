import {Injectable} from '@angular/core';
import {Capacitor, Plugins, PushNotification, PushNotificationActionPerformed, PushNotificationToken} from '@capacitor/core';
import {EventsService} from './events.service';
import {StorageService} from './storage.service';
import {FCM} from '@capacitor-community/fcm';
import {LoggerService} from './logger.service';

const {PushNotifications} = Plugins;
const fcm = new FCM();

export enum PushTopic {
    HOUSE_ALL
}

@Injectable({
    providedIn: 'root'
})
export class PushService {
    private readonly logger = LoggerService.getLogger(PushService.name);

    constructor(private events: EventsService,
                private storage: StorageService) {
    }

    initialize(): Promise<boolean> {
        if (!Capacitor.isPluginAvailable('PushNotifications')) {
            return Promise.resolve(false);
        }

        PushNotifications.addListener(
            'registration',
            (token: PushNotificationToken) => {
                this.storage.set('pushToken', token.value);
            },
        );

        PushNotifications.addListener('registrationError', (error: any) => {
            this.logger.warn({
                message: 'registration error',
                error,
            });
        });

        PushNotifications.addListener(
            'pushNotificationReceived',
            (notification: PushNotification) => {
                this.events.publish('push:received', notification);
            },
        );

        PushNotifications.addListener(
            'pushNotificationActionPerformed',
            (notification: PushNotificationActionPerformed) => {
                this.events.publish('push:action', notification);
            },
        );

        // Request permission to use push notifications
        // iOS will prompt user and return if they granted permission or not
        // Android will just grant without prompting
        return this.requestPushRegister()
            .then(() => true)
            .catch(() => false);
    }

    subscribeTopic(topic: PushTopic, data: { [key: string]: string }) {
        if (!Capacitor.isPluginAvailable('PushNotifications')) {
            return Promise.resolve();
        }

        this.requestPushRegister()
            .then(() => {
                let subTopic;
                switch (topic) {
                    case PushTopic.HOUSE_ALL:
                        subTopic = 'houses_' + data.houseId + '_all';
                }

                if (subTopic) {
                    fcm.subscribeTo({
                        topic: subTopic
                    }).then(() => {
                        switch (topic) {
                            case PushTopic.HOUSE_ALL:
                                this.storage.set(`${data.accountId}_enablePush`, true);
                        }
                    }).catch(err => {
                        this.logger.error({message: 'subscribeToTopic', error: err});
                    });
                }
            });
    }

    unsubscribeTopic(topic: PushTopic, data: { [key: string]: string }) {
        if (!Capacitor.isPluginAvailable('PushNotifications')) {
            return Promise.resolve();
        }

        this.requestPushRegister()
            .then(() => {
                let subTopic;
                switch (topic) {
                    case PushTopic.HOUSE_ALL:
                        subTopic = 'houses_' + data.houseId + '_all';
                }

                if (subTopic) {
                    fcm.unsubscribeFrom({
                        topic: subTopic
                    }).then(() => {
                        switch (topic) {
                            case PushTopic.HOUSE_ALL:
                                this.storage.set(`${data.accountId}_enablePush`, false);
                        }
                    }).catch((err) => {
                        this.logger.error({message: 'unsubscribeFromTopic', error: err});
                    });
                }
            });
    }

    removeNotifications() {
        if (!Capacitor.isPluginAvailable('PushNotifications')) {
            return Promise.resolve();
        }

        PushNotifications.removeAllDeliveredNotifications();
    }

    private requestPushRegister(): Promise<void> {
        return PushNotifications.requestPermission().then(result => {
            if (result.granted) {
                // Register with Apple / Google to receive push via APNS/FCM
                return PushNotifications.register();

            } else {
                // Show some error
                Promise.reject('No permission');
            }
        });
    }
}
