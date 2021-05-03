import {Injectable} from '@angular/core';
import {Currency, House, houseConverter, HouseInvite, houseInviteConverter, UserAccount} from '@core/models';
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
import {AngularFirePerformance, trace} from '@angular/fire/performance';
import User = firebase.User;

const {Permissions} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class HouseService {
    private readonly logger = LoggerService.getLogger(HouseService.name);
    currentHouseId: string;
    private currentUserId: string;
    private housesSubject: BehaviorSubject<House[]> = new BehaviorSubject<House[]>([]);
    private destroyerSubject: Subject<void> = new Subject();
    private houses$: Observable<House[]>;
    private housesSub;

    constructor(private fs: AngularFirestore,
                private functions: AngularFireFunctions,
                private performance: AngularFirePerformance,
                private authService: AuthService,
                private eventsService: EventsService,
                private analyticsService: AnalyticsService,
                private pushService: PushService,
                private translate: TranslateService) {
    }

    observeHouses(userId: string): Observable<House[]> {
        if (this.currentUserId !== userId || !this.houses$) {
            this.currentUserId = userId;

            this.initializeHousesObserver(userId);

            this.houses$ = this.housesSubject.asObservable()
                .pipe(
                    takeUntil(this.destroyerSubject)
                );
        }

        return this.houses$;
    }

    observeHouse(houseId: string): Observable<House> {
        let userId = this.authService.currentUser?.uid;

        // For debug purposes.
        if (!userId) {
            userId = localStorage.getItem('userId');
        }

        return this.observeHouses(userId).pipe(
            map(houses => houses.find(g => g.id === houseId)),
        );
    }

    private initializeHousesObserver(userId: string) {
        if (this.housesSub) {
            this.housesSub();
        }

        this.housesSub = this.fs.collection('houses')
            .ref
            .where('members', 'array-contains', userId)
            .withConverter(houseConverter)
            .onSnapshot(snapshot => {
                if (snapshot.empty) {
                    this.housesSubject.next([]);
                } else {
                    this.housesSubject.next(snapshot.docs
                        .map((doc) => doc.data())
                        .sort((g1: House, g2: House) => {
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
        this.currentHouseId = undefined;
        this.currentUserId = undefined;
        this.destroyerSubject.next();
        this.housesSubject.next(undefined);
    }

    getHouse(id: string): Promise<House | undefined> {
        return this.fs.collection('houses')
            .doc(id)
            .ref
            .withConverter(houseConverter)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.exists) {
                    return querySnapshot.data();
                } else {
                    return Promise.reject(this.translate.instant('errors.house-creation-error'));
                }
            })
            .catch(err => {
                this.logger.error({message: 'getHouse', data: {houseId: id}, error: err});
                return Promise.reject(this.translate.instant('errors.house-not-retrieved'));
            });
    }

    getHouseByInviteLink(link: string): Promise<HouseInvite> {
        return this.fs.collection('houseInvites')
            .doc(link)
            .ref
            .withConverter(houseInviteConverter)
            .get()
            .then((snapshot) => {
                if (!snapshot.exists) {
                    return Promise.reject(this.translate.instant('errors.house-not-found'));
                }

                const invite: HouseInvite = snapshot.data();

                if (invite.isExpired) {
                    return Promise.reject(this.translate.instant('errors.house-invite-expired'));
                }

                return this.houses$.pipe(take(1)).toPromise().then((houses) => {
                    // If user is not already a member of this house
                    if (!houses.find(house => house.id === invite.houseId)) {
                        return invite;
                    }
                });
            });
    }

    /**
     * Create a new house
     * @param name Name of house
     * @return newly created house's uid
     */
    createHouse(name: string): Promise<string> {
        const user = this.authService.currentUser;
        const house = House.new(user, name, Currency.EURO);

        return this.fs.collection('houses')
            .add(houseConverter.toFirestore(house))
            .then(docRef => {

                this.analyticsService.logCreateHouse(this.authService.currentUser.uid, docRef.id);

                return docRef.id;
            })
            .then((houseId: string) => {
                return this.renewInviteLink(houseId, name).then(() => {
                    return houseId;
                });
            })
            .catch(err => {
                this.logger.error({message: 'createHouse', error: err});

                return Promise.reject(this.translate.instant('errors.house-creation-error'));
            });
    }

    joinHouse(houseInvite: HouseInvite, user: User) {
        const callable = this.functions.httpsCallable('joinHouse');
        callable({
            houseId: houseInvite.houseId,
            inviteLink: houseInvite.inviteLink,
            user: user.toJSON(),
        })
            .pipe(
                trace('joinHouse'),
                catchError((err) => {
                    this.logger.error({message: 'joinHouse', error: err});
                    this.eventsService.publish('house:joined');
                    return err;
                }))
            .subscribe((account: UserAccount) => {
                if (account) {
                    this.analyticsService.logJoinHouse(user.uid, houseInvite.houseId);

                    // Enable push messages for this user.
                    Permissions.query({
                        name: PermissionType.Notifications
                    }).then((result) => {
                        if (result.state === 'granted') {
                            this.pushService.subscribeTopic(PushTopic.HOUSE_ALL, {houseId: houseInvite.houseId, accountId: account.id});
                        }
                    });

                    this.eventsService.publish('house:joined');
                }
            });
    }

    leaveHouse(houseId: string, userId: string) {
        const callable = this.functions.httpsCallable('leaveHouse');
        callable({
            houseId
        })
            .pipe(
                trace('leaveHouse'),
                catchError((err) => {
                    this.logger.error({message: 'leaveHouse', error: err});
                    this.eventsService.publish('house:left', false);
                    return EMPTY;
                }))
            .subscribe((account) => {
                if (account) {
                    this.analyticsService.logLeaveHouse(userId, houseId);

                    this.eventsService.publish('house:left', true);

                    // Enable push messages for this user.
                    Permissions.query({
                        name: PermissionType.Notifications
                    }).then((result) => {
                        if (result.state === 'granted') {
                            this.pushService.unsubscribeTopic(PushTopic.HOUSE_ALL, {houseId, accountId: account.id});
                        }
                    });
                }
            });
    }

    async renewInviteLink(houseId: string, houseName: string, oldInvite?: string): Promise<string> {
        const houseInvite: HouseInvite = HouseInvite.generate(houseId, houseName);

        if (oldInvite) {
            await this.fs.collection('houseInvites').doc(oldInvite).delete();
        }

        return Promise.all([
            this.fs.collection('houses').doc(houseId)
                .update({
                    inviteLink: houseInvite.inviteLink,
                    inviteLinkExpiry: houseInvite.expiry
                }),
            this.fs.collection('houseInvites')
                .doc(houseInvite.inviteLink)
                .set(houseInviteConverter.toFirestore(houseInvite))
        ]).then(() => {
            return houseInvite.inviteLink;
        });
    }
}
