import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';

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

    constructor(private modalController: ModalController) {
    }

    static async presentModal(modalController: ModalController, titleId: string, contentId: string) {
        const modal = await modalController.create({
            component: InfoModalComponent,
            componentProps: {
                titleId,
                contentId,
            },
            swipeToClose: true,
        });

        return await modal.present();
    }

    ngOnInit() {
    }

    dismiss() {
        this.modalController.dismiss();
    }
}
