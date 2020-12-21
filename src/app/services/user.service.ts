import {Injectable} from '@angular/core';
import {AuthService} from './auth.service';
import {Group} from '../models';
import firebase from 'firebase';
import User = firebase.User;

@Injectable({
    providedIn: 'root'
})
export class UserService {

    groups: Group[] = [];
    user: User;

    constructor(private authService: AuthService) {
        this.authService.user
            .subscribe(user => {
                this.user = user;
            });
    }

    setName(newName: string): Promise<void> {
        return this.authService.currentUser
            .then(user => {
                return user.updateProfile({
                        displayName: newName
                    })
                    .catch(err => {
                        // TODO Error handling
                    });
            });
    }

    setGroups(groups: Group[]) {
        this.groups = [...groups];
    }
}
