import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {GroupService} from '../../../services/group.service';
import {UserService} from '../../../services/user.service';
import {UIService} from '../../../services/ui.service';
import {TranslateService} from '@ngx-translate/core';
import {Group} from '../../../models';
import {PermissionType, Plugins} from '@capacitor/core';
import {AlertController, NavController} from '@ionic/angular';
import {PushService, PushTopic} from '../../../services/push.service';

const {Clipboard, Share, Permissions} = Plugins;

@Component({
    selector: 'app-new-group',
    templateUrl: './new-group.component.html',
    styleUrls: ['./new-group.component.scss'],
})
export class NewGroupComponent implements OnInit {
    groupForm: FormGroup;
    isSubmitted: boolean;
    groupCreated: boolean;
    loading: boolean;

    name: string;
    group: Group;
    sharedGroup: boolean;

    constructor(private formBuilder: FormBuilder,
                private groupService: GroupService,
                private userService: UserService,
                private uiService: UIService,
                private translate: TranslateService,
                private alertController: AlertController,
                private pushService: PushService,
                private navController: NavController) {
        this.groupForm = this.formBuilder.group({
            name: ['', [Validators.required]],
        });
    }

    ngOnInit() {
    }

    get form() {
        return this.groupForm.controls;
    }

    setName() {
        this.isSubmitted = true;
        if (this.groupForm.invalid) {
            return;
        }

        this.name = this.form.name.value;

        if (this.name.length >= 3) {
            this.groupCreated = true;
            this.loading = true;
            this.groupService.createGroup(this.name)
                .then((groupId) => {
                    return this.groupService.getGroup(groupId);
                })
                .then((group) => {
                    if (group) {
                        this.group = group;

                        Permissions.query({
                            name: PermissionType.Notifications
                        }).then((result) => {
                            if (result.state === 'granted') {
                                this.pushService.subscribeTopic(PushTopic.GROUP_ALL, {groupId: group.id, accountId: group.accounts[0].id});
                            }
                        });
                    } else {
                        // FIXME
                    }
                })
                .catch((err) => {
                    console.error(err);
                    this.groupCreated = false;
                })
                .finally(() => {
                    this.loading = false;
                });
        } else {
            this.groupForm.controls.name.setErrors({
                length: true
            });
        }
    }

    async shareGroup() {
        try {
            await Share.share({
                title: this.translate.instant('group.settings.inviteAccount.title', {group: this.group.name}),
                text: this.translate.instant('group.settings.inviteAccount.description', {group: this.group.name}),
                url: 'https://streepn.nl/group-invite/' + this.group.inviteLink,
                dialogTitle: this.translate.instant('group.settings.inviteAccount.dialogTitle')
            });
        } catch (e) {
            const alert = await this.alertController.create({
                header: this.translate.instant('group.settings.addAccount.header'),
                message: this.translate.instant('group.settings.addAccount.message') + '<br><br><b>' + this.group.inviteLink + '</b>',
                buttons: [
                    {
                        text: this.translate.instant('actions.cancel'),
                        role: 'cancel'
                    }, {
                        text: this.translate.instant('actions.copy') + ' ' + this.translate.instant('group.settings.addAccount.code'),
                        handler: () => {
                            Clipboard.write({
                                string: this.group.inviteLink
                            });
                        }
                    }
                ]
            });

            await alert.present();
        }

        this.sharedGroup = true;
    }

    navigateSettings() {
        this.navController.navigateRoot(['group', this.group.id, 'settings'], {
            animationDirection: 'forward'
        });
    }
}
