import {AfterViewInit, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {AlertController, IonRouterOutlet, LoadingController, ModalController, NavController} from '@ionic/angular';
import {Observable, Subscription} from 'rxjs';
import firebase from 'firebase/app';
import {House, HouseInvite, UserAccount} from '@core/models';
import {AdsService, AuthService, EventsService, HouseService, LoggerService, StorageService, UIService} from '@core/services';
import {TranslateService} from '@ngx-translate/core';
import {take} from 'rxjs/operators';
import {OnboardingComponent} from '@modules/dashboard/onboarding/onboarding.component';
import {Capacitor} from '@capacitor/core';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faTicket} from '@fortawesome/pro-duotone-svg-icons';
import {NewHouseComponent} from '@modules/dashboard/new-house/new-house.component';
import User = firebase.User;
import {InfoModalComponent} from '@shared/components/info-modal/info-modal.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy, AfterViewInit {
    user$: Observable<User>;
    private houses$: Observable<House[]>;
    private housesSub: Subscription;
    houses?: House[];
    loading: boolean;
    private userSub: Subscription;
    private readonly logger = LoggerService.getLogger(DashboardPage.name);
    private user: User;
    private loadingHouseJoin?: HTMLIonLoadingElement;
    private onboarding: boolean;
    houseAccounts: { [houseId: string]: UserAccount } = {};
    iOS: boolean;

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
                private uiService: UIService,
                private ads: AdsService,
                private iconLibrary: FaIconLibrary,
                private routerOutlet: IonRouterOutlet) {
        this.iconLibrary.addIcons(faTicket);
        this.iOS = Capacitor.isNative && Capacitor.platform === 'ios';
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
                            this.houses = houses;
                            this.houseAccounts = {};

                            houses?.forEach(house => {
                                this.houseAccounts[house.id] = house.getUserAccountByUserId(user.uid);
                            });

                            this.loading = false;
                        });
                }
            });

        this.eventsService.subscribe('app:resume', () => {
            this.checkForHouseInvite();
        });
    }

    ngOnDestroy() {
        this.userSub.unsubscribe();
        this.housesSub?.unsubscribe();
        this.eventsService.unsubscribe('app:resume', () => {
            this.checkForHouseInvite();
        });
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

    ionViewDidEnter() {
        if (!this.onboarding) {
            this.ads.showBanner();
        }
    }

    ionViewWillLeave() {
        this.ads.hideBanner();
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
                            this.uiService.showError(
                                this.translate.instant('errors.error'),
                                this.translate.instant('dashboard.houseInvite.invalidCode')
                            );
                        }
                    }
                }
            ]
        });

        await alert.present();
    }

    private launchOnBoarding() {
        this.onboarding = true;
        this.ads.hideBanner();
        this.modalController.create({
            // swipeToClose: false,
            // backdropDismiss: false,
            component: OnboardingComponent
        }).then((modal) => {
            this.zone.run(() => {
                modal.onDidDismiss()
                    .then(() => {
                        this.onboarding = false;
                        this.ads.showBanner();
                    });
                modal.present();
            });
        });
    }

    private checkForHouseInvite() {
        this.storage.get('houseInvite')
            .then((invite: string) => {
                return this.storage.get('hasOnboarded')
                    .then((hasOnboarded: boolean) => {
                        if (hasOnboarded) {
                            this.promptHouseInvite(invite);
                        }
                    });
            })
            .catch(() => {
            });
    }

    private promptHouseInvite(houseInvite: string) {
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
                        }).then(alert => {
                            return alert.present();
                        });
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                this.logger.error({
                    message: err
                });
                this.uiService.showError(this.translate.instant('errors.error'), err);
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

    openHouse(house: House) {
        this.navController.navigateRoot(['house', house.id, 'home'], {
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
        InfoModalComponent.presentModal(this.modalController, this.routerOutlet, 'information.dashboard.title', 'information.dashboard.content');
    }
}
