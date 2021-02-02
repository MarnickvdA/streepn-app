import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import firebase from 'firebase/app';
import {NavController} from '@ionic/angular';
import {AuthService} from '@core/services';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faAt, faClock, faUser} from '@fortawesome/pro-duotone-svg-icons';
import User = firebase.User;

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
    user$: Observable<User>;

    constructor(private authService: AuthService,
                private navController: NavController,
                private iconLibrary: FaIconLibrary) {
        this.iconLibrary.addIcons(faUser, faClock, faAt);
        this.user$ = this.authService.user;
    }


    ngOnInit() {
    }

    getReadableTime(time: string) {
        return new Date(Date.parse(time)).toLocaleDateString();
    }
}
