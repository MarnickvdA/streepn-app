import {Component, OnInit, Renderer2} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Observable} from 'rxjs';
import firebase from 'firebase/app';
import {NavController} from '@ionic/angular';
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
                private navController: NavController) {
        this.user$ = this.authService.user;
        this.isDarkMode = window.localStorage.getItem('darkMode') === 'true';
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
        window.localStorage.setItem('darkMode', event.detail.checked);
    }

}
