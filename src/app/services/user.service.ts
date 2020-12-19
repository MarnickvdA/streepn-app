import {Injectable} from '@angular/core';
import {AuthService} from './auth.service';
import {Group} from '../models';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    groups: Group[] = [];

    constructor(private authService: AuthService) {
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
