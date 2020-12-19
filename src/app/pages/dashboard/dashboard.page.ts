import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {NavController} from '@ionic/angular';
import {Observable} from 'rxjs';
import firebase from 'firebase/app';
import {Group} from '../../models';
import {GroupService} from '../../services/group.service';
import User = firebase.User;
import {UserService} from '../../services/user.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

    user: Observable<User>;

    constructor(private authService: AuthService,
                private navController: NavController,
                private groupService: GroupService,
                public userService: UserService) {
    }

    ngOnInit() {
        this.user = this.authService.user;

        this.groupService.getGroups()
            .then(groups => {
                this.userService.setGroups(groups);
            });
    }

    logout() {
        this.authService.logout()
            .then(() => {
                this.navController.navigateRoot('/login');
            });
    }
}
