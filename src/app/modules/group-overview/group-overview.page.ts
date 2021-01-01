import {Component, OnDestroy} from '@angular/core';
import {GroupService} from '../../core/services/group.service';
import {Observable, Subscription} from 'rxjs';
import {Group, Product, UserAccount} from '../../core/models';
import {ActivatedRoute, Params} from '@angular/router';
import {AuthService} from '../../core/services/auth.service';
import {AlertController, LoadingController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {ProductService} from '../../core/services/product.service';
import {Plugins} from '@capacitor/core';

const {Clipboard, Share} = Plugins;

@Component({
    selector: 'app-group-overview',
    templateUrl: './group-overview.page.html',
    styleUrls: ['./group-overview.page.scss'],
})
export class GroupOverviewPage implements OnDestroy {

    groupId: string;
    isAdmin: boolean;
    inviteLink: string;
    inviteLinkExpired: boolean;
    group$: Observable<Group>;
    private group: Group;
    private groupSub: Subscription;

    constructor(private groupService: GroupService,
                private authService: AuthService,
                private route: ActivatedRoute,
                private alertController: AlertController,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private productService: ProductService) {
        this.route.params.subscribe((params: Params) => {
            this.groupId = params.id;

            this.group$ = this.groupService.observeGroup(params.id);

            this.groupSub = this.group$
                .subscribe(group => {
                    this.group = group;

                    if (group) {
                        this.inviteLink = group.inviteLink;
                        this.inviteLinkExpired = group.inviteLinkExpiry.toDate() < new Date();
                        this.isAdmin = group.accounts.find(account => account.userId === this.authService.currentUser.uid)?.roles.includes('ADMIN') || false;
                    }
                });
        });
    }

    ngOnDestroy(): void {
        this.groupSub.unsubscribe();
    }

    isAccountOwner(account: UserAccount): boolean {
        return account.userId === this.authService.currentUser?.uid;
    }

    removeProduct(product: Product) {
        this.productService.removeProduct(this.group, product);
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