import {Injectable} from '@angular/core';
import {Capacitor, Plugins, PushNotification, PushNotificationActionPerformed, PushNotificationToken} from '@capacitor/core';
import {EventsService} from './events.service';
import {StorageService} from './storage.service';
import {FCM} from '@capacitor-community/fcm';

const {PushNotifications} = Plugins;
const fcm = new FCM();

export enum PushTopic {
    GROUP_ALL
}

@Injectable({
    providedIn: 'root'
})
export class PushService {

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
            // alert('Error on registration: ' + JSON.stringify(error));
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

    subscribeTopic(topic: PushTopic, id: string) {
        if (!Capacitor.isPluginAvailable('PushNotifications')) {
            return Promise.reject('PushNotifications not supported');
        }

        this.requestPushRegister()
            .then(() => {
                let subTopic;
                switch (topic) {
                    case PushTopic.GROUP_ALL:
                        subTopic = 'groups_' + id + '_all';
                }

                if (subTopic) {
                    fcm.subscribeTo({
                        topic: subTopic
                    });
                }
            });
    }

    unsubscribeTopic(topic: PushTopic, id: string) {
        if (!Capacitor.isPluginAvailable('PushNotifications')) {
            return Promise.reject('PushNotifications not supported');
        }

        this.requestPushRegister()
            .then(() => {
                let subTopic;
                switch (topic) {
                    case PushTopic.GROUP_ALL:
                        subTopic = 'groups_' + id + '_all';
                }

                if (subTopic) {
                    fcm.unsubscribeFrom({
                        topic: subTopic
                    });
                }
            });
    }
}
