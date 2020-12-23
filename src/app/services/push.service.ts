import {Injectable} from '@angular/core';
import {Capacitor, Plugins, PushNotification, PushNotificationActionPerformed, PushNotificationToken} from '@capacitor/core';

const {PushNotifications} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class PushService {

    constructor() {
    }

    initialize() {
        if (!Capacitor.isPluginAvailable('PushNotifications')) {
            return;
        }

        // Request permission to use push notifications
        // iOS will prompt user and return if they granted permission or not
        // Android will just grant without prompting
        PushNotifications.requestPermission().then(result => {
            if (result.granted) {
                // Register with Apple / Google to receive push via APNS/FCM
                PushNotifications.register();
            } else {
                // Show some error
            }
        });

        PushNotifications.addListener(
            'registration',
            (token: PushNotificationToken) => {
                alert('Push registration success, token: ' + token.value);
            },
        );

        PushNotifications.addListener('registrationError', (error: any) => {
            alert('Error on registration: ' + JSON.stringify(error));
        });

        PushNotifications.addListener(
            'pushNotificationReceived',
            (notification: PushNotification) => {
                alert('Push received: ' + JSON.stringify(notification));
            },
        );

        PushNotifications.addListener(
            'pushNotificationActionPerformed',
            (notification: PushNotificationActionPerformed) => {
                alert('Push action performed: ' + JSON.stringify(notification));
            },
        );
    }
}
