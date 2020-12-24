import {Component} from '@angular/core';
import {GroupService} from '../../services/group.service';
import {Observable} from 'rxjs';
import {Group, Product} from '../../models';
import {ActivatedRoute, Params} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {AlertController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {Capacitor, Plugins} from '@capacitor/core';
import {ProductService} from '../../services/product.service';
import {AccountService} from 'src/app/services/account.service';

const {Clipboard, Share} = Plugins;

@Component({
    selector: 'app-group-settings',
    templateUrl: './group-settings.page.html',
    styleUrls: ['./group-settings.page.scss'],
})
export class GroupSettingsPage {

    groupId: string;
    isAdmin: boolean;
    inviteLink: string;
    group$: Observable<Group>;
    private group: Group;

    constructor(private groupService: GroupService,
                private authService: AuthService,
                private route: ActivatedRoute,
                private alertController: AlertController,
                private translate: TranslateService,
                private productService: ProductService,
                private accountService: AccountService) {
        this.route.params.subscribe((params: Params) => {
            this.groupId = params.id;

            this.group$ = this.groupService.observeGroup(params.id);

            this.authService.currentUser
                .then(user => {
                    this.group$
                        .subscribe(group => {
                            this.group = group;
                            this.inviteLink = group.inviteLink;
                            this.isAdmin = group.accounts.find(account => account.userId === user.uid)?.roles.includes('ADMIN') || false;
                        });
                });
        });
    }

    async inviteAccounts() {
        try {
            await Share.share({
                title: this.translate.instant('group.settings.inviteAccount.title', {group: this.group.name}),
                text: this.translate.instant('group.settings.inviteAccount.description', {group: this.group.name}),
                url: 'https://streepn.nl/group-invite/' + this.inviteLink,
                dialogTitle: this.translate.instant('group.settings.inviteAccount.dialogTitle')
            });
        } catch (e) {
            const alert = await this.alertController.create({
                header: this.translate.instant('group.settings.addAccount.header'),
                message: this.translate.instant('group.settings.addAccount.message') + '<br><br><b>' + this.inviteLink + '</b>',
                buttons: [
                    {
                        text: this.translate.instant('actions.cancel'),
                        role: 'cancel'
                    }, {
                        text: this.translate.instant('actions.copy') + ' ' + this.translate.instant('group.settings.addAccount.code'),
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

    async addSharedAccount() {
        const alert = await this.alertController.create({
            header: this.translate.instant('group.settings.addSharedAccount.header'),
            inputs: [
                {
                    name: 'accountName',
                    type: 'text',
                    placeholder: this.translate.instant('group.settings.addSharedAccount.accountName')
                }
            ],
            buttons: [
                {
                    text: this.translate.instant('actions.cancel'),
                    role: 'cancel',
                }, {
                    text: this.translate.instant('actions.create'),
                    handler: (result: { accountName: string }) => {
                        if (result.accountName.length > 0) {
                            this.accountService.addSharedAccount(this.group, result.accountName);
                        } else {
                            // TODO Error message
                        }
                    }
                }
            ]
        });

        await alert.present();
    }

    async addProduct() {
        const alert = await this.alertController.create({
            header: this.translate.instant('group.settings.addProduct.header'),
            inputs: [
                {
                    name: 'groupName',
                    type: 'text',
                    placeholder: this.translate.instant('group.settings.addProduct.productName')
                },
                {
                    name: 'price',
                    type: 'number',
                    placeholder: this.translate.instant('group.settings.addProduct.productPrice')
                }
            ],
            buttons: [
                {
                    text: this.translate.instant('actions.cancel'),
                    role: 'cancel',
                }, {
                    text: this.translate.instant('actions.create'),
                    handler: (result: { groupName: string, price: number }) => {
                        if (result.groupName.length > 3 && result.price > 0) {
                            this.productService.addProduct(this.group, result.groupName, result.price);
                        } else {
                            // TODO Error message
                        }
                    }
                }
            ]
        });

        await alert.present();
    }

    removeProduct(product: Product) {
        this.productService.removeProduct(this.group, product);
    }
}
