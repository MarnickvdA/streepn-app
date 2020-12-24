import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Observable} from 'rxjs';
import firebase from 'firebase/app';
import {NavController} from '@ionic/angular';
import {StorageService} from '../../services/storage.service';
import User = firebase.User;

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
    }

}
