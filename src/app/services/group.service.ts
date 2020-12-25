import {Injectable} from '@angular/core';
import {Group, groupConverter, UserAccount} from '../models';
import {AuthService} from './auth.service';
import {EventsService} from './events.service';
import {AngularFireFunctions} from '@angular/fire/functions';
import firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';
import {EMPTY, Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {createGroup} from '../models/group';
import {v4 as uuidv4} from 'uuid';
import {AnalyticsService} from './analytics.service';
import {UserService} from './user.service';
import Timestamp = firebase.firestore.Timestamp;
import User = firebase.User;

@Injectable({
    providedIn: 'root'
})
export class GroupService {

    constructor(private fs: AngularFirestore,
                private functions: AngularFireFunctions,
                private authService: AuthService,
                private eventsService: EventsService,
                private analyticsService: AnalyticsService,
                private userService: UserService) {
    }

    observeGroups(userId: string): firebase.firestore.Query<Group> {
        return this.fs.collection('groups')
            .ref
            .where('members', 'array-contains', userId)
            .withConverter(groupConverter);
    }

    getGroup(id: string): Promise<Group | undefined> {
        return this.fs.collection('groups')
            .doc(id)
            .ref
            .withConverter(groupConverter)
            .get()
            .then(querySnapshot => {
                return querySnapshot.data();
            });
    }

    getGroupByInviteLink(link: string): Promise<Group | undefined> {
        return this.fs.collection('groups')
            .ref
            .where('inviteLinkExpiry', '>', Timestamp.now())
            .where('inviteLink', '==', link)
            .withConverter(groupConverter)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.empty) {
                    return Promise.reject('No group not found');
                }

                return querySnapshot.docs.pop().data();
            })
            .catch(err => {
                console.error(err);
                return Promise.reject();
            });
    }

    observeGroup(id: string): Observable<Group> {
        return this.fs.collection('groups')
            .doc(id)
            .snapshotChanges()
            .pipe(
                map(action => {
                    return createGroup(action.payload.id, action.payload.data());
                })
            );
    }

    /**
     * Create a new group
     * @param name Name of group
     * @return newly created group's uid
     */
    createGroup(name: string): Promise<string> {
        return this.authService.currentUser
            .then(user => {
                const now = Timestamp.now();
                const date = new Date();
                date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
                const nextWeek = Timestamp.fromDate(date);
                const randomLink = uuidv4().substring(0, 8).toUpperCase();

                const group = {
                    name,
                    accounts: [{
                        id: uuidv4(),
                        name: user.displayName,
                        photoUrl: user.photoURL,
                        roles: ['ADMIN'],
                        userId: user.uid,
                        balance: 0,
                        createdAt: now,
                    } as UserAccount],
                    members: [user.uid],
                    valuta: 'EUR',
                    createdAt: now,
                    inviteLink: randomLink,
                    inviteLinkExpiry: nextWeek,
                } as Group;

                return this.fs.collection('groups')
                    .add(groupConverter.toFirestore(group))
                    .then(docRef => {

                        this.analyticsService.logCreateGroup(this.userService.user.uid, docRef.id);

                        return docRef.id;
                    })
                    .catch(err => {
                        this.eventsService.publish('http:error', err);
                        return Promise.reject(err);
                    });
            });
    }

    joinGroup(groupId: string, user: User) {
        const callable = this.functions.httpsCallable('joinGroup');
        callable({groupId, user})
            .pipe(catchError((err) => {
                console.error(err);
                return EMPTY;
            }))
            .subscribe(data => {
                this.analyticsService.logJoinGroup(user.uid, groupId);

                this.eventsService.publish('group:joined');
            });
    }
}
