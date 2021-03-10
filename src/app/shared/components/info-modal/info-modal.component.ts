import {Component, Input, OnInit} from '@angular/core';
import {IonRouterOutlet, ModalController} from '@ionic/angular';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faTimesCircle} from '@fortawesome/pro-duotone-svg-icons';

@Component({
    selector: 'app-info-modal',
    templateUrl: './info-modal.component.html',
    styleUrls: ['./info-modal.component.scss'],
})
export class InfoModalComponent implements OnInit {

    @Input()
    titleId: string;

    @Input()
    contentId: string;

    constructor(private modalController: ModalController,
                private iconLibrary: FaIconLibrary) {
        this.iconLibrary.addIcons(faTimesCircle);
    }

    static async presentModal(modalController: ModalController, routerOutlet: IonRouterOutlet, titleId: string, contentId: string) {
        const modal = await modalController.create({
            component: InfoModalComponent,
            componentProps: {
                titleId,
                contentId,
            },
            swipeToClose: true,
            presentingElement: routerOutlet.nativeEl
        });

        return await modal.present();
    }

    ngOnInit() {
    }

    dismiss() {
        this.modalController.dismiss();
    }
}
