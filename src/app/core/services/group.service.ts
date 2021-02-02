import {Injectable} from '@angular/core';
import {Currency, Group, groupConverter, GroupInvite, groupInviteConverter, UserAccount} from '@core/models';
import {AuthService} from './auth.service';
import {EventsService} from './events.service';
import {AngularFireFunctions} from '@angular/fire/functions';
import firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';
import {BehaviorSubject, EMPTY, Observable, Subject} from 'rxjs';
import {catchError, map, take, takeUntil} from 'rxjs/operators';
import {AnalyticsService} from './analytics.service';
import {PermissionType, Plugins} from '@capacitor/core';
import {PushService, PushTopic} from './push.service';
import {TranslateService} from '@ngx-translate/core';
import {LoggerService} from './logger.service';
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
        this.currentGroupId = undefined;
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

    getGroupByInviteLink(link: string): Promise<GroupInvite> {
        return this.fs.collection('groupInvites')
            .doc(link)
            .ref
            .withConverter(groupInviteConverter)
            .get()
            .then((snapshot) => {
                if (!snapshot.exists) {
                    return Promise.reject(this.translate.instant('errors.group-not-found'));
                }

                const invite: GroupInvite = snapshot.data();

                if (invite.isExpired) {
                    return Promise.reject(this.translate.instant('errors.group-invite-expired'));
                }

                return this.groups$.pipe(take(1)).toPromise().then((groups) => {
                    // If user is not already a member of this group
                    if (!groups.find(group => group.id === invite.groupId)) {
                        return invite;
                    }
                });
            });
    }

    /**
     * Create a new group
     * @param name Name of group
     * @return newly created group's uid
     */
    createGroup(name: string): Promise<string> {
        const user = this.authService.currentUser;
        const group = Group.new(user, name, Currency.EURO);

        return this.fs.collection('groups')
            .add(groupConverter.toFirestore(group))
            .then(docRef => {

                this.analyticsService.logCreateGroup(this.authService.currentUser.uid, docRef.id);

                return docRef.id;
            })
            .then((groupId: string) => {
                return this.renewInviteLink(groupId, name).then(() => {
                    return groupId;
                });
            })
            .catch(err => {
                this.logger.error({message: 'createGroup', error: err});

                return Promise.reject(this.translate.instant('errors.group-creation-error'));
            });
    }

    joinGroup(groupInvite: GroupInvite, user: User) {
        const callable = this.functions.httpsCallable('joinGroup');
        callable({
            groupId: groupInvite.groupId,
            inviteLink: groupInvite.inviteLink,
            user
        })
            .pipe(
                catchError((err) => {
                    this.logger.error({message: 'joinGroup', error: err});
                    this.eventsService.publish('group:joined');
                    return err;
                }))
            .subscribe((account: UserAccount) => {
                if (account) {
                    this.analyticsService.logJoinGroup(user.uid, groupInvite.groupId);

                    // Enable push messages for this user.
                    Permissions.query({
                        name: PermissionType.Notifications
                    }).then((result) => {
                        if (result.state === 'granted') {
                            this.pushService.subscribeTopic(PushTopic.GROUP_ALL, {groupId: groupInvite.groupId, accountId: account.id});
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
            .pipe(
                catchError((err) => {
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

    async renewInviteLink(groupId: string, groupName: string, oldInvite?: string): Promise<string> {
        const groupInvite: GroupInvite = GroupInvite.generate(groupId, groupName);

        if (oldInvite) {
            await this.fs.collection('groupInvites').doc(oldInvite).delete();
        }

        return Promise.all([
            this.fs.collection('groups').doc(groupId)
                .update({
                    inviteLink: groupInvite.inviteLink,
                    inviteLinkExpiry: groupInvite.expiry
                }),
            this.fs.collection('groupInvites')
                .doc(groupInvite.inviteLink)
                .set(groupInviteConverter.toFirestore(groupInvite))
        ]).then(() => {
            return groupInvite.inviteLink;
        });
    }
}
