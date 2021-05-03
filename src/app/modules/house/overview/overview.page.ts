import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {House, SharedAccount, UserAccount} from '@core/models';
import {ActivatedRoute} from '@angular/router';
import {AlertController, LoadingController, ModalController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {Plugins} from '@capacitor/core';
import {NewSharedAccountComponent} from './new-shared-account/new-shared-account.component';
import {AuthService, HouseService, ProductService} from '@core/services';

const {Clipboard, Share} = Plugins;

@Component({
    selector: 'app-house-overview',
    templateUrl: './overview.page.html',
    styleUrls: ['./overview.page.scss'],
})
export class OverviewPage implements OnInit, OnDestroy {

    houseId: string;
    isAdmin: boolean;
    inviteLink: string;
    inviteLinkExpired: boolean;
    house$: Observable<House>;
    house: House;
    private houseSub: Subscription;

    constructor(private houseService: HouseService,
                private authService: AuthService,
                private route: ActivatedRoute,
                private alertController: AlertController,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private productService: ProductService,
                private modalController: ModalController,
                private navController: NavController) {
    }

    ngOnInit() {
        this.house$ = this.houseService.observeHouse(this.houseService.currentHouseId);

        this.houseSub = this.house$
            .subscribe(house => {
                this.house = house;

                if (house) {
                    this.inviteLink = house.inviteLink;
                    this.inviteLinkExpired = house.inviteLinkExpiry.toDate() < new Date();
                    this.isAdmin = house.isAdmin(this.authService.currentUser.uid);
                }
            });
    }

    ngOnDestroy(): void {
        this.houseSub.unsubscribe();
    }

    isAccountOwner(account: UserAccount): boolean {
        return account.userId === this.authService.currentUser?.uid;
    }

    addSharedAccount() {
        this.modalController.create({
            component: NewSharedAccountComponent,
            componentProps: {
                house$: this.house$
            },
            swipeToClose: true
        }).then((modal) => {
            modal.present();
        });
    }

    async shareHouse() {
        if (this.inviteLinkExpired) {
            const alert = await this.alertController.create({
                header: this.translate.instant('house.overview.refreshLink.header'),
                message: this.translate.instant('house.overview.refreshLink.message'),
                buttons: [
                    {
                        text: this.translate.instant('actions.cancel'),
                        role: 'cancel'
                    }, {
                        text: this.translate.instant('actions.refresh'),
                        handler: async () => {
                            const loading = await this.loadingController.create({
                                backdropDismiss: false,
                                message: this.translate.instant('actions.saving')
                            });

                            await loading.present();
                            this.houseService.renewInviteLink(this.house.id, this.house.name, this.house.inviteLink)
                                .then((inviteLink) => {
                                    this.inviteLink = inviteLink;
                                    this.shareHouse();
                                })
                                .finally(() => {
                                    loading.dismiss();
                                });
                        }
                    }
                ]
            });

            await alert.present();

            return;
        }

        try {
            await Share.share({
                title: this.translate.instant('house.overview.inviteAccount.title', {house: this.house.name}),
                text: this.translate.instant('house.overview.inviteAccount.description', {house: this.house.name}),
                url: 'https://streepn.nl/house-invite/' + this.inviteLink,
                dialogTitle: this.translate.instant('house.overview.inviteAccount.dialogTitle')
            });
        } catch (e) {
            const alert = await this.alertController.create({
                header: this.translate.instant('house.overview.addAccount.header'),
                message: this.translate.instant('house.overview.addAccount.message') + '<br><br><b>' + this.inviteLink + '</b>',
                buttons: [
                    {
                        text: this.translate.instant('actions.cancel'),
                        role: 'cancel'
                    }, {
                        text: this.translate.instant('actions.copy') + ' ' + this.translate.instant('house.overview.addAccount.code'),
                        handler: () => {
                            Clipboard.write({
                                string: this.inviteLink
                            });
                        }
                    }
                ]
            });

            await alert.present();
        }
    }

    openAccount(account: SharedAccount) {
        if (this.isAdmin) {
            this.navController.navigateForward(`house/${this.house.id}/preferences/shared-accounts/${account.id}`, {
                state: {
                    account
                }
            });
        }
    }

    fakePull($event) {
        setTimeout(() => {
            $event.target.complete();
        }, 350);
    }
}
