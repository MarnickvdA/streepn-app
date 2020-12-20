import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {NavController} from '@ionic/angular';
import {Observable} from 'rxjs';
import firebase from 'firebase/app';
import {GroupService} from '../../services/group.service';
import {UserService} from '../../services/user.service';
import User = firebase.User;

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

    addGroup() {
        this.groupService.createGroup('Asgard');
    }
}
