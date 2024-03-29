import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {House} from '@core/models';
import {AlertController, ModalController, NavController} from '@ionic/angular';
import {HouseService, LoggerService, PushService, PushTopic} from '@core/services';
import {TranslateService} from '@ngx-translate/core';
import {Share} from '@capacitor/share';
import {Clipboard} from '@capacitor/clipboard';

@Component({
    selector: 'app-new-house',
    templateUrl: './new-house.component.html',
    styleUrls: ['./new-house.component.scss'],
})
export class NewHouseComponent implements OnInit {
    houseForm: FormGroup;
    isSubmitted: boolean;
    houseCreated: boolean;
    loading: boolean;
    name: string;
    city: string;
    house: House;
    sharedHouse: boolean;
    readonly selectableCities = [
        'Amsterdam',
        'Delft',
        'Den Haag',
        'Eindhoven',
        'Enschede',
        'Groningen',
        'Leeuwarden',
        'Leiden',
        'Maastricht',
        'Nijmegen',
        'Rotterdam',
        'Tilburg',
        'Utrecht',
        'Wageningen',
        'Overig'
    ];

    private readonly logger = LoggerService.getLogger(NewHouseComponent.name);

    constructor(private formBuilder: FormBuilder,
                public houseService: HouseService,
                private translate: TranslateService,
                private alertController: AlertController,
                private pushService: PushService,
                private navController: NavController,
                private modalController: ModalController) {
        this.houseForm = this.formBuilder.group({
            name: ['', [Validators.required]],
            city: ['', [Validators.required]],
        });
    }

    get form() {
        return this.houseForm.controls;
    }

    ngOnInit() {
    }

    submitHouseInformation() {
        this.isSubmitted = true;
        if (this.houseForm.invalid) {
            return;
        }

        this.name = this.form.name.value;
        this.city = this.form.city.value;

        if (this.name.length >= 3) {
            this.houseCreated = true;
            this.loading = true;
            this.houseService.createHouse(this.name, this.city)
                .then((houseId) => this.houseService.getHouse(houseId))
                .then((house) => {
                    if (house) {
                        this.house = house;
                        this.pushService.subscribeTopic(PushTopic.houseAll, {houseId: house.id, accountId: house.accounts[0].id});
                    } else {
                        // FIXME
                    }
                })
                .catch(() => {
                    this.houseCreated = false;
                })
                .finally(() => {
                    this.loading = false;
                });
        } else {
            this.houseForm.controls.name.setErrors({
                length: true
            });
        }
    }

    async shareHouse() {
        try {
            await Share.share({
                title: this.translate.instant('house.overview.inviteAccount.title', {house: this.house.name}),
                text: this.translate.instant('house.overview.inviteAccount.description', {house: this.house.name}),
                url: 'https://streepn.nl/house-invite/' + this.house.inviteLink,
                dialogTitle: this.translate.instant('house.overview.inviteAccount.dialogTitle')
            });
        } catch (e) {
            const alert = await this.alertController.create({
                header: this.translate.instant('house.overview.addAccount.header'),
                message: this.translate.instant('house.overview.addAccount.message') + '<br><br><b>' + this.house.inviteLink + '</b>',
                buttons: [
                    {
                        text: this.translate.instant('actions.cancel'),
                        role: 'cancel'
                    }, {
                        text: this.translate.instant('actions.copy') + ' ' + this.translate.instant('house.overview.addAccount.code'),
                        handler: () => {
                            Clipboard.write({
                                // eslint-disable-next-line id-blacklist
                                string: this.house.inviteLink
                            });
                        }
                    }
                ]
            });

            await alert.present();
        }

        this.sharedHouse = true;
    }

    navigateHouseOverview() {
        this.navController.navigateRoot(['house', this.house.id, 'preferences'], {
            animationDirection: 'forward'
        });

        this.dismiss();
    }

    dismiss() {
        this.modalController.dismiss();
    }
}
