import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import firebase from 'firebase/app';
import {MenuController, NavController} from '@ionic/angular';
import {AuthService} from '@core/services';
import User = firebase.User;

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
    user$: Observable<User>;

    constructor(private authService: AuthService,
                private navController: NavController) {
        this.user$ = this.authService.user;
    }


    ngOnInit() {
    }

    getReadableTime(time: string) {
        return new Date(Date.parse(time)).toLocaleDateString();
    }

    logout() {
        this.authService.logout()
            .then(() => {
                this.navController.navigateRoot('/login');
            });
    }
}
