import {Injectable} from '@angular/core';
import {Capacitor, Plugins, PushNotification, PushNotificationActionPerformed, PushNotificationToken} from '@capacitor/core';
import {EventsService} from './events.service';
import {StorageService} from './storage.service';

const {PushNotifications} = Plugins;

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
        return PushNotifications.requestPermission().then(result => {
            if (result.granted) {
                // Register with Apple / Google to receive push via APNS/FCM
                PushNotifications.register();
            } else {
                // Show some error
            }

            return result.granted;
        });
    }
}
