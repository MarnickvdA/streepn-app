import {Injectable} from '@angular/core';
import {AlertController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class UIService {

    private currentAlert: HTMLIonAlertElement;

    constructor(private alertController: AlertController,
                private translate: TranslateService) {
    }

    async showError(header: string, message: string) {
        this.currentAlert = await this.alertController.create({
            header,
            message,
            buttons: [
                {
                    text: this.translate.instant('actions.ok')
                }
            ]
        });

        await this.currentAlert.present();

        this.currentAlert.onDidDismiss().then(() => {
            this.currentAlert = undefined;
        });
    }

    dismissAlert() {
        this.currentAlert?.dismiss();
    }
}
