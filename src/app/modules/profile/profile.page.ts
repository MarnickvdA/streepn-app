import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import firebase from 'firebase/app';
import {AlertController, LoadingController, NavController} from '@ionic/angular';
import {AuthService} from '@core/services';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faAt, faClock, faUser} from '@fortawesome/pro-duotone-svg-icons';
import {TranslateService} from '@ngx-translate/core';
import User = firebase.User;
import Timestamp = firebase.firestore.Timestamp;

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
    user$: Observable<User>;

    constructor(private authService: AuthService,
                private navController: NavController,
                private alertController: AlertController,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private iconLibrary: FaIconLibrary) {
        this.iconLibrary.addIcons(faUser, faClock, faAt);
        this.user$ = this.authService.user;
    }


    ngOnInit() {
    }

    getTimestamp(time: string): Timestamp {
        return Timestamp.fromMillis(Date.parse(time));
    }

    async updateName(name: string) {
        const alert = await this.alertController.create({
            header: this.translate.instant('profile.edit.username'),
            inputs: [
                {
                    name: 'username',
                    type: 'text',
                    value: name
                },
            ],
            buttons: [
                {
                    text: this.translate.instant('actions.cancel'),
                    role: 'cancel',
                    cssClass: 'secondary',
                }, {
                    text: this.translate.instant('actions.submit'),
                    handler: async (data: { username: string }) => {
                        if (data.username !== name && data.username.length > 2) {
                            const loading = await this.loadingController.create({
                                backdropDismiss: false,
                                message: this.translate.instant('actions.updating')
                            });

                            loading.present();

                            // TODO error handling
                            this.authService.setName(data.username)
                                .finally(() => {
                                    loading.dismiss();
                                });
                        }
                    }
                }
            ]
        });

        await alert.present();
    }

    updateEmail() {

    }

    updatePassword() {

    }
}
