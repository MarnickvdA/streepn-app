import {Injectable} from '@angular/core';
import {Group, groupConverter, UserAccount} from '../models';
import {AuthService} from './auth.service';
import {EventsService} from './events.service';
import {AngularFireFunctions} from '@angular/fire/functions';
import firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';
import {BehaviorSubject, EMPTY, Observable, Subject} from 'rxjs';
import {catchError, map, takeUntil} from 'rxjs/operators';
import {v4 as uuidv4} from 'uuid';
import {AnalyticsService} from './analytics.service';
import {PermissionType, Plugins} from '@capacitor/core';
import {PushService, PushTopic} from './push.service';
import {TranslateService} from '@ngx-translate/core';
import {LoggerService} from './logger.service';
import Timestamp = firebase.firestore.Timestamp;
import User = firebase.User;

const {Permissions} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class GroupService {
    private readonly logger = LoggerService.getLogger(GroupService.name);
    currentGroupId: string;
    private currentUserId: string;
    private groupsSubject: BehaviorSubject<Group[]> = new BehaviorSubject<Group[]>([]);
    private destroyerSubject: Subject<void> = new Subject();
    private groups$: Observable<Group[]>;
    private groupsSub;

    constructor(private fs: AngularFirestore,
                private functions: AngularFireFunctions,
                private authService: AuthService,
                private eventsService: EventsService,
                private analyticsService: AnalyticsService,
                private pushService: PushService,
                private translate: TranslateService) {
    }

    observeGroups(userId: string): Observable<Group[]> {
        if (this.currentUserId !== userId || !this.groups$) {
            this.currentUserId = userId;

            this.initializeGroupsObserver(userId);

            this.groups$ = this.groupsSubject.asObservable()
                .pipe(
                    takeUntil(this.destroyerSubject)
                );
        }

        return this.groups$;
    }

    observeGroup(groupId: string): Observable<Group> {
        let userId = this.authService.currentUser?.uid;

        // For debug purposes.
        if (!userId) {
            userId = localStorage.getItem('userId');
        }

        return this.observeGroups(userId).pipe(
            map(groups => groups.find(g => g.id === groupId)),
        );
    }

    private initializeGroupsObserver(userId: string) {
        if (this.groupsSub) {
            this.groupsSub();
        }

        this.groupsSub = this.fs.collection('groups')
            .ref
            .where('members', 'array-contains', userId)
            .withConverter(groupConverter)
            .onSnapshot(snapshot => {
                if (snapshot.empty) {
                    this.groupsSubject.next([]);
                } else {
                    this.groupsSubject.next(snapshot.docs
                        .map((doc) => doc.data())
                        .sort((g1: Group, g2: Group) => {
                            const d1 = g1.createdAt.toDate().getTime();
                            const d2 = g2.createdAt.toDate().getTime();

                            if (d1 === d2) {
                                return 0;
                            }
                            if (d1 > d2) {
                                return 1;
                            }
                            if (d1 < d2) {
                                return -1;
                            }
                        }));
                }
            });
    }

    unsubscribe() {
        this.currentUserId = undefined;
        this.destroyerSubject.next();
        this.groupsSubject.next(undefined);
    }

    getGroup(id: string): Promise<Group | undefined> {
        return this.fs.collection('groups')
            .doc(id)
            .ref
            .withConverter(groupConverter)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.exists) {
                    return querySnapshot.data();
                } else {
                    return Promise.reject(this.translate.instant('errors.group-creation-error'));
                }
            })
            .catch(err => {
                this.logger.error({message: 'getGroup', data: {groupId: id}, error: err});
                return Promise.reject(this.translate.instant('errors.group-not-retrieved'));
            });
    }

    getGroupByInviteLink(link: string): Promise<Group | undefined> {
        return this.fs.collection('groups')
            .ref
            .where('inviteLink', '==', link)
            .withConverter(groupConverter)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.empty) {
                    return Promise.reject(this.translate.instant('errors.group-not-found'));
                }

                const group = querySnapshot.docs.pop().data();

                if (group.inviteLinkExpiry.toMillis() < new Date().getMilliseconds()) {
                    return Promise.reject(this.translate.instant('errors.group-invite-expired'));
                }

                return group;
            });
    }

    /**
     * Create a new group
     * @param name Name of group
     * @return newly created group's uid
     */
    createGroup(name: string): Promise<string> {
        const user = this.authService.currentUser;
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
                totalIn: 0,
                totalOut: 0,
                createdAt: now,
            } as UserAccount],
            members: [user.uid],
            valuta: 'EUR',
            createdAt: now,
            inviteLink: randomLink,
            inviteLinkExpiry: nextWeek,
            totalIn: 0,
            totalOut: 0,
        } as Group;

        return this.fs.collection('groups')
            .add(groupConverter.toFirestore(group))
            .then(docRef => {

                this.analyticsService.logCreateGroup(this.authService.currentUser.uid, docRef.id);

                return docRef.id;
            })
            .catch(err => {
                this.logger.error({message: 'createGroup', error: err});

                return Promise.reject(this.translate.instant('errors.group-creation-error'));
            });
    }

    joinGroup(groupId: string, user: User) {
        const callable = this.functions.httpsCallable('joinGroup');
        callable({
            groupId, user: {
                displayName: user.displayName,
                photoURL: user.photoURL
            }
        })
            .pipe(catchError((err) => {
                this.logger.error({message: 'joinGroup', error: err});
                this.eventsService.publish('group:joined');
                return EMPTY;
            }))
            .subscribe((account) => {
                if (account) {
                    this.analyticsService.logJoinGroup(user.uid, groupId);

                    // Enable push messages for this user.
                    Permissions.query({
                        name: PermissionType.Notifications
                    }).then((result) => {
                        if (result.state === 'granted') {
                            this.pushService.subscribeTopic(PushTopic.GROUP_ALL, {groupId, accountId: account.id});
                        }
                    });

                    this.eventsService.publish('group:joined');
                }
            });
    }

    leaveGroup(groupId: string, userId: string) {
        const callable = this.functions.httpsCallable('leaveGroup');
        callable({
            groupId
        })
            .pipe(catchError((err) => {
                this.logger.error({message: 'leaveGroup', error: err});
                this.eventsService.publish('group:left', false);
                return EMPTY;
            }))
            .subscribe((account) => {
                if (account) {
                    this.analyticsService.logLeaveGroup(userId, groupId);

                    this.eventsService.publish('group:left', true);

                    // Enable push messages for this user.
                    Permissions.query({
                        name: PermissionType.Notifications
                    }).then((result) => {
                        if (result.state === 'granted') {
                            this.pushService.unsubscribeTopic(PushTopic.GROUP_ALL, {groupId, accountId: account.id});
                        }
                    });
                }
            });
    }

    renewInviteLink(groupId: string): Promise<string> {
        const date = new Date();
        date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
        const nextWeek = Timestamp.fromDate(date);
        const randomLink = uuidv4().substring(0, 8).toUpperCase();

        return this.fs.collection('groups')
            .doc(groupId)
            .update({
                inviteLink: randomLink,
                inviteLinkExpiry: nextWeek
            })
            .then(() => {
                return randomLink;
            });
    }
}
