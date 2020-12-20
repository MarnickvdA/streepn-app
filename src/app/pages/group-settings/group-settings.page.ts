import {Component, OnDestroy, OnInit} from '@angular/core';
import {GroupService} from '../../services/group.service';
import {Observable} from 'rxjs';
import {Group} from '../../models';
import {ActivatedRoute, Params} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {AlertController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {Plugins} from '@capacitor/core';

const {Clipboard} = Plugins;

@Component({
    selector: 'app-group-settings',
    templateUrl: './group-settings.page.html',
    styleUrls: ['./group-settings.page.scss'],
})
export class GroupSettingsPage implements OnInit, OnDestroy {

    isAdmin: boolean;
    inviteLink: string;
    group$: Observable<Group>;

    private unsubscribe;

    constructor(private groupService: GroupService,
                private authService: AuthService,
                private route: ActivatedRoute,
                private alertController: AlertController,
                private translate: TranslateService) {
        this.route.params.subscribe((params: Params) => {
            this.group$ = this.groupService.observeGroup(params.id);

            this.authService.currentUser
                .then(user => {
                    this.unsubscribe = this.group$
                        .subscribe(group => {
                            this.inviteLink = group.inviteLink;
                            this.isAdmin = group.accounts.find(account => account.userId === user.uid)?.roles.includes('ADMIN') || false;
                        });
                });
        });
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.unsubscribe();
    }

    async addAccounts() {
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
