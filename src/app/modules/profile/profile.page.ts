import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {AlertController, LoadingController, NavController} from '@ionic/angular';
import {AuthService} from '@core/services';
import {TranslateService} from '@ngx-translate/core';
import {ImageService} from '@core/services/image.service';
import {User} from '@angular/fire/auth';
import { Timestamp } from '@angular/fire/firestore';

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
                private imageService: ImageService) {
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

    takePicture(userId: string) {
        this.imageService.takeProfilePicture(userId);
    }
}
