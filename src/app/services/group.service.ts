import {Injectable} from '@angular/core';
import {Account, Group, groupConverter} from '../models';
import {FirestoreService} from './firestore.service';
import {AuthService} from './auth.service';
import {EventsService} from './events.service';
import {AngularFireFunctions} from '@angular/fire/functions';
import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

@Injectable({
    providedIn: 'root'
})
export class GroupService {

    constructor(private firestoreService: FirestoreService,
                private functions: AngularFireFunctions,
                private authService: AuthService,
                private eventsService: EventsService) {
    }

    getGroups(): Promise<Group[]> {
        return this.authService.currentUser
            .then(user => {
                return this.firestoreService.groupsCollection
                    .ref
                    .where(`members`, 'array-contains', user.uid)
                    .withConverter(groupConverter)
                    .get()
                    .then(querySnapshot => {
                        const groups: Group[] = [];

                        querySnapshot.docs.forEach(doc => {
                            groups.push(doc.data());
                        });

                        return groups;
                    });
            });
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
                const nextWeek = Timestamp.fromMillis(new Date(Date.now() + 6.048e+8).getMilliseconds());
                const randomLink = 'ABC123XX';

                const group = {
                    name,
                    accounts: [{
                        name: user.displayName,
                        roles: ['ADMIN'],
                        userId: user.uid,
                        balance: 0,
                        createdAt: now
                    } as Account],
                    members: [user.uid],
                    valuta: 'EUR',
                    createdAt: now,
                    inviteLink: randomLink,
                    inviteLinkExpiry: nextWeek,
                } as Group;

                return this.firestoreService.groupsCollection
                    .add(groupConverter.toFirestore(group))
                    .then(docRef => {
                        return docRef.id;
                    })
                    .catch(err => {
                        this.eventsService.publish('http:error', err);
                        return Promise.reject(err);
                    });
            });
    }

    joinGroup(inviteLink: string) {
        const callable = this.functions.httpsCallable('join-group');
        callable({inviteLink})
            .subscribe(data => {
                // TODO Get id for group back and go to the group page
            });
    }
}
