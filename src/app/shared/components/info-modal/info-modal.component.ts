import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {ModalController} from '@ionic/angular';

@Component({
    selector: 'app-info-modal',
    templateUrl: './info-modal.component.html',
    styleUrls: ['./info-modal.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class InfoModalComponent implements OnInit {

    @Input()
    titleId: string;

    @Input()
    contentHTML: string;

    constructor(private modalController: ModalController) {
    }

    static async presentModal(modalController: ModalController, titleId: string, contentHTML: string) {
        const modal = await modalController.create({
            component: InfoModalComponent,
            componentProps: {
                titleId,
                contentHTML,
            },
            swipeToClose: true
        });

        return await modal.present();
    }

    ngOnInit() {
    }

    dismiss() {
        this.modalController.dismiss();
    }
}
