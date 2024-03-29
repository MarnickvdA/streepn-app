import {Injectable} from '@angular/core';
import {Currency, House, houseConverter, HouseInvite, houseInviteConverter, UserAccount} from '@core/models';
import {AlertService, AnalyticsService, AuthService, EventsService, LoggerService} from '@core/services';
import {AngularFireFunctions} from '@angular/fire/functions';
import firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';
import {BehaviorSubject, EMPTY, Observable, Subject} from 'rxjs';
import {catchError, map, take, takeUntil} from 'rxjs/operators';
import {PushService, PushTopic} from '../firebase/push.service';
import {TranslateService} from '@ngx-translate/core';
import {AngularFirePerformance, trace} from '@angular/fire/performance';
import User = firebase.User;
import {ApiErrorMessage, AppErrorMessage} from '@core/services/alert.service';

@Injectable({
    providedIn: 'root'
})
export class HouseService {
    currentHouseId: string;
    private readonly logger = LoggerService.getLogger(HouseService.name);
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
                private alertService: AlertService,
                private translate: TranslateService) {
        this.houses$ = new Observable<House[]>();
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

    unsubscribe() {
        this.currentHouseId = undefined;
        this.currentUserId = undefined;
        this.destroyerSubject.next();
        this.housesSubject.next(undefined);
    }

    getLatestHouseValue(houseId: string): House | undefined {
        return this.housesSubject.getValue().find(h => h.id === houseId);
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
                    this.alertService.promptApiError(ApiErrorMessage.houseCodeInvalid);
                    return Promise.reject();
                }

                const invite: HouseInvite = snapshot.data();

                if (invite.isExpired) {
                    this.alertService.promptApiError(ApiErrorMessage.houseCodeExpired);
                    return Promise.reject();
                }

                return this.houses$.pipe(take(1)).toPromise().then((houses) => {
                    // If user is not already a member of this house
                    if (!houses.find(house => house.id === invite.houseId)) {
                        return invite;
                    }
                });
            });
    }

    createHouse(name: string, city: string): Promise<string> {
        const user = this.authService.currentUser;
        const house = House.new(user, name, city, Currency.euro);

        return this.fs.collection('houses')
            .add(houseConverter.toFirestore(house))
            .then(docRef => {
                this.analyticsService.logCreateHouse(docRef.id);

                return docRef.id;
            })
            .then((houseId: string) => this.renewInviteLink(houseId, name).then(() => houseId))
            .catch(err => {
                this.logger.error({message: 'createHouse', error: err});
                this.alertService.promptAppError(AppErrorMessage.houseCreationFailed);
                return Promise.reject();
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
                    this.alertService.promptApiError(err.message);
                    this.eventsService.publish('house:joined');
                    return EMPTY;
                }))
            .subscribe((account: UserAccount) => {
                if (account) {
                    this.analyticsService.logJoinHouse(houseInvite.houseId);
                    this.pushService.subscribeTopic(PushTopic.houseAll, {houseId: houseInvite.houseId, accountId: account.id});
                    this.eventsService.publish('house:joined');
                }
            });
    }

    leaveHouse(houseId: string, userId: string) {
        const house = this.housesSubject.getValue().find(h => h.id === houseId);
        if (!house) {
            this.alertService.promptApiError(ApiErrorMessage.houseNotFound);
            return;
        }

        const userAccount = house.getUserAccountByUserId(userId);
        if (!userAccount) {
            this.alertService.promptApiError(ApiErrorMessage.userAccountNotFound);
            return;
        }

        if (!userAccount.isRemovable) {
            this.alertService.promptApiError(ApiErrorMessage.houseLeaveDenied);
            return;
        }

        if (this.currentUserId !== userId && !this.authService.currentUserIsAdmin(house)) {
            this.alertService.promptApiError(ApiErrorMessage.houseNotAdmin);
            return;
        }

        const callable = this.functions.httpsCallable('leaveHouse');
        return callable({
            houseId,
            userId
        })
            .pipe(
                trace('leaveHouse'),
                catchError((err) => {
                    this.alertService.promptApiError(err.message);
                    this.eventsService.publish('house:left', false);
                    return EMPTY;
                }))
            .subscribe((account) => {
                if (account) {
                    this.analyticsService.logLeaveHouse(houseId);
                    this.eventsService.publish('house:left', true);
                    this.pushService.unsubscribeTopic(PushTopic.houseAll, {houseId, accountId: account.id});
                }
            });
    }

    async renewInviteLink(houseId: string, houseName: string, oldInvite?: string): Promise<string> {
        const house = this.housesSubject.getValue().find(h => h.id === houseId);
        if (!house) {
            this.alertService.promptApiError(ApiErrorMessage.houseNotFound);
            return Promise.reject('renewInviteLink: House not found');
        }

        if (!this.authService.currentUserIsAdmin(house)) {
            this.alertService.promptApiError(ApiErrorMessage.houseNotAdmin);
            return Promise.reject('renewInviteLink: Only admins can remove other users from a house');
        }

        const houseInvite: HouseInvite = HouseInvite.generate(houseId, houseName);

        if (oldInvite) {
            await this.fs.collection('houseInvites').doc(oldInvite).delete();
        }

        await this.fs.collection('houseInvites')
            .doc(houseInvite.inviteLink)
            .set(houseInviteConverter.toFirestore(houseInvite));

        await this.fs.collection('houses').doc(houseId)
            .set({
                inviteLink: houseInvite.inviteLink,
                inviteLinkExpiry: houseInvite.expiry
            }, {merge: true});

        return houseInvite.inviteLink;
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
}
