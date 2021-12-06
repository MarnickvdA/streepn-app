import {AfterViewInit, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {AlertController, LoadingController, ModalController, NavController} from '@ionic/angular';
import {Observable, Subscription} from 'rxjs';
import firebase from 'firebase/app';
import {House, HouseInvite, UserAccount} from '@core/models';
import {AuthService, EventsService, HouseService, LoggerService, StorageService} from '@core/services';
import {TranslateService} from '@ngx-translate/core';
import {take} from 'rxjs/operators';
import {OnboardingComponent} from '@modules/dashboard/onboarding/onboarding.component';
import {Capacitor} from '@capacitor/core';
import {NewHouseComponent} from '@modules/dashboard/new-house/new-house.component';
import {InfoModalComponent} from '@shared/components/info-modal/info-modal.component';
import {dashboardPageGuide} from '@shared/components/info-modal/info-guides';
import {AlertService, ApiErrorMessage} from '@core/services/alert.service';
import User = firebase.User;

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy, AfterViewInit {
    user$: Observable<User>;
    houses?: House[];
    loading: boolean;
    houseAccounts: { [houseId: string]: UserAccount } = {};
    iOS: boolean;

    private houses$: Observable<House[]>;
    private housesSub: Subscription;
    private userSub: Subscription;
    private readonly logger = LoggerService.getLogger(DashboardPage.name);
    private user: User;
    private loadingHouseJoin?: HTMLIonLoadingElement;
    private onboarding: boolean;
    private promptingHouseInvite = false;

    constructor(private authService: AuthService,
                private navController: NavController,
                private houseService: HouseService,
                private alertController: AlertController,
                private translate: TranslateService,
                private zone: NgZone,
                private eventsService: EventsService,
                private loadingController: LoadingController,
                private modalController: ModalController,
                private storage: StorageService,
                private alertService: AlertService) {
        this.iOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
        this.loading = true;
    }

    ngOnInit() {
        this.user$ = this.authService.user;

        this.userSub = this.user$.subscribe(user => {
            this.user = user;
        });

        this.user$.pipe(take(1))
            .subscribe(user => {
                if (user) {
                    this.houses$ = this.houseService.observeHouses(user.uid);
                    this.housesSub = this.houses$
                        .subscribe(houses => {
                            if (houses) {
                                this.houses = houses;
                                this.houseAccounts = {};

                                houses?.forEach(house => {
                                    this.houseAccounts[house.id] = house.getUserAccountByUserId(user.uid);
                                });

                                this.zone.run(() => setTimeout(() => {
                                    this.loading = false;
                                }, 500));
                            }
                        });
                }
            });

        this.eventsService.subscribe('app:resume', this.checkHouseInviteListener);
    }

    ngOnDestroy() {
        this.userSub.unsubscribe();
        this.housesSub?.unsubscribe();
        this.eventsService.unsubscribe('app:resume', this.checkHouseInviteListener);
    }

    ngAfterViewInit() {
        this.storage.get('hasOnboarded')
            .then((hasOnboarded: boolean) => {
                if (hasOnboarded) {
                    this.checkForHouseInvite();
                } else {
                    this.launchOnBoarding();
                }
            })
            .catch(() => {
                this.launchOnBoarding();
            });
    }

    async promptManualHouseJoin() {
        const alert = await this.alertController.create({
            header: this.translate.instant('dashboard.houseInvite.manualHeader'),
            inputs: [
                {
                    name: 'houseCode',
                    type: 'text',
                    placeholder: this.translate.instant('dashboard.houseInvite.code')
                }
            ],
            buttons: [
                {
                    text: this.translate.instant('actions.cancel'),
                    role: 'cancel',
                }, {
                    text: this.translate.instant('actions.submit'),
                    handler: (result: { houseCode: string }) => {
                        if (result.houseCode.length === 8) {
                            this.promptHouseInvite(result.houseCode);
                        } else {
                            this.alertService.promptApiError(ApiErrorMessage.houseCodeInvalid);
                        }
                    }
                }
            ]
        });

        await alert.present();
    }

    openHouse(house: House) {
        this.navController.navigateRoot(['house', house.id, 'transactions'], {
            animationDirection: 'forward',
        });
    }

    addHouse() {
        this.modalController.create({
            swipeToClose: true,
            backdropDismiss: true,
            component: NewHouseComponent
        }).then((modal) => {
            this.zone.run(() => {
                modal.present();
            });
        });
    }

    openInfo() {
        InfoModalComponent.presentModal(
            this.modalController,
            'dashboard.title',
            dashboardPageGuide
        );
    }

    fakePull($event) {
        setTimeout(() => {
            $event.target.complete();
        }, 350);
    }

    private checkHouseInviteListener = () => this.checkForHouseInvite();

    private launchOnBoarding() {
        this.onboarding = true;
        this.modalController.create({
            // swipeToClose: false,
            // backdropDismiss: false,
            component: OnboardingComponent
        }).then((modal) => {
            this.zone.run(() => {
                modal.onDidDismiss()
                    .then(() => {
                        this.onboarding = false;
                    });
                modal.present();
            });
        });
    }

    private checkForHouseInvite(): void {
        Promise.all([
            this.storage.get('houseInvite'),
            this.storage.get('hasOnboarded')
        ]).then(([invite, hasOnboarded]) => {
            if (invite && hasOnboarded && !this.promptingHouseInvite) {
                this.promptHouseInvite(invite as string);
            }
        }).catch(() => {
        });
    }

    private promptHouseInvite(houseInvite: string) {
        this.promptingHouseInvite = true;

        // Fuck this item, don't want it more than once.
        this.storage.delete('houseInvite');

        this.houseService.getHouseByInviteLink(houseInvite)
            .then(invite => {
                if (invite) {
                    this.zone.run(() => {
                        this.alertController.create({
                                header: this.translate.instant('dashboard.houseInvite.header'),
                                message: this.translate.instant('dashboard.houseInvite.question') + '<b>' + invite.houseName + '</b>?',
                                buttons: [
                                    {
                                        text: this.translate.instant('actions.deny'),
                                        role: 'cancel'
                                    }, {
                                        text: this.translate.instant('actions.accept'),
                                        handler: () => {
                                            this.joinHouse(invite);
                                        }
                                    }
                                ]
                            })
                            .then(alert => alert.present())
                            .finally(() => this.promptingHouseInvite = false);
                    });
                }
            })
            .catch(() => {
                this.promptingHouseInvite = false;
            });
    }

    private joinHouse(houseInvite: HouseInvite) {
        this.showLoading();

        this.eventsService.subscribe('house:joined', () => {
            this.loadingHouseJoin?.dismiss();

            this.eventsService.unsubscribe('house:joined');
        });

        this.houseService.joinHouse(houseInvite, this.user);
    }

    private async showLoading() {
        this.loadingHouseJoin = await this.loadingController.create({
            message: this.translate.instant('actions.joining'),
            translucent: true,
            backdropDismiss: false
        });

        await this.loadingHouseJoin.present();

        this.loadingHouseJoin.onDidDismiss()
            .then(() => {
                this.loadingHouseJoin = undefined;
            });
    }
}
