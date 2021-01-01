import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../core/services/auth.service';
import {Observable} from 'rxjs';
import firebase from 'firebase/app';
import {NavController} from '@ionic/angular';
import {StorageService} from '../../core/services/storage.service';
import {Capacitor, Plugins, StatusBarStyle} from '@capacitor/core';
import User = firebase.User;

const {StatusBar} = Plugins;

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
    user$: Observable<User>;
    isDarkMode: boolean;

    constructor(private authService: AuthService,
                private navController: NavController,
                private storage: StorageService) {
        this.user$ = this.authService.user;
        this.storage.get('darkMode')
            .then((darkMode: boolean) => {
                this.isDarkMode = darkMode;
            });
    }


    ngOnInit() {
    }

    logout() {
        this.authService.logout()
            .then(() => {
                this.navController.navigateRoot('/login');
            });
    }

    onClick(event) {
        document.body.classList.toggle('dark', event.detail.checked);
        this.storage.set('darkMode', event.detail.checked);

        if (Capacitor.isPluginAvailable('StatusBar')) {
            StatusBar.setStyle({
                style: event.detail.checked ? StatusBarStyle.Dark : StatusBarStyle.Light
            });

            if (event.detail.checked) {
                StatusBar.setBackgroundColor({color: '#000000'});
            } else {
                StatusBar.setBackgroundColor({color: '#FFFFFF'});
            }
        }
    }

}
