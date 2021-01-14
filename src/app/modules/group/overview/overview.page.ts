import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Group, UserAccount} from '@core/models';
import {ActivatedRoute} from '@angular/router';
import {AlertController, LoadingController, ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {Plugins} from '@capacitor/core';
import {NewProductComponent} from './new-product/new-product.component';
import {NewSharedAccountComponent} from './new-shared-account/new-shared-account.component';
import {AuthService, GroupService, ProductService} from '@core/services';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faShareAltSquare} from '@fortawesome/pro-duotone-svg-icons';

const {Clipboard, Share} = Plugins;

@Component({
    selector: 'app-group-overview',
    templateUrl: './overview.page.html',
    styleUrls: ['./overview.page.scss'],
})
export class OverviewPage implements OnInit, OnDestroy {

    groupId: string;
    isAdmin: boolean;
    inviteLink: string;
    inviteLinkExpired: boolean;
    group$: Observable<Group>;
    group: Group;
    private groupSub: Subscription;

    constructor(private groupService: GroupService,
                private authService: AuthService,
                private route: ActivatedRoute,
                private alertController: AlertController,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private productService: ProductService,
                private modalController: ModalController,
                private iconLibrary: FaIconLibrary) {
        this.iconLibrary.addIcons(faShareAltSquare);
    }

    ngOnInit() {
        this.group$ = this.groupService.observeGroup(this.groupService.currentGroupId);

        this.groupSub = this.group$
            .subscribe(group => {
                this.group = group;

                if (group) {
                    this.inviteLink = group.inviteLink;
                    this.inviteLinkExpired = group.inviteLinkExpiry.toDate() < new Date();
                    this.isAdmin = group.accounts.find(account => account.userId === this.authService.currentUser.uid)?.roles.includes('ADMIN') || false;
                }
            });
    }

    ngOnDestroy(): void {
        this.groupSub.unsubscribe();
    }

    isAccountOwner(account: UserAccount): boolean {
        return account.userId === this.authService.currentUser?.uid;
    }

    addSharedAccount() {
        this.modalController.create({
            component: NewSharedAccountComponent,
            componentProps: {
                group$: this.group$
            },
            swipeToClose: true
        }).then((modal) => {
            modal.present();
        });
    }

    addProduct() {
        this.modalController.create({
            component: NewProductComponent,
            componentProps: {
                group$: this.group$
            },
            swipeToClose: true
        }).then((modal) => {
            modal.present();
        });
    }

    async shareGroup() {
        if (this.inviteLinkExpired) {
            const alert = await this.alertController.create({
                header: this.translate.instant('group.overview.refreshLink.header'),
                message: this.translate.instant('group.overview.refreshLink.message'),
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
                            this.groupService.renewInviteLink(this.group.id)
                                .then((inviteLink) => {
                                    this.inviteLink = inviteLink;
                                    this.shareGroup();
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
                title: this.translate.instant('group.overview.inviteAccount.title', {group: this.group.name}),
                text: this.translate.instant('group.overview.inviteAccount.description', {group: this.group.name}),
                url: 'https://streepn.nl/group-invite/' + this.inviteLink,
                dialogTitle: this.translate.instant('group.overview.inviteAccount.dialogTitle')
            });
        } catch (e) {
            const alert = await this.alertController.create({
                header: this.translate.instant('group.overview.addAccount.header'),
                message: this.translate.instant('group.overview.addAccount.message') + '<br><br><b>' + this.inviteLink + '</b>',
                buttons: [
                    {
                        text: this.translate.instant('actions.cancel'),
                        role: 'cancel'
                    }, {
                        text: this.translate.instant('actions.copy') + ' ' + this.translate.instant('group.overview.addAccount.code'),
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
}
