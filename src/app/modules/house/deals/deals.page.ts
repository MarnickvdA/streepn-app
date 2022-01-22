import {Component, OnDestroy, OnInit} from '@angular/core';
import {AdvertisementService, HouseService} from '@core/services';
import {Observable, Subscription} from 'rxjs';
import {House} from '@core/models';
import {AdvertisementItem} from '@core/models/advertisement';
import { Browser } from '@capacitor/browser';
import {ViewDidEnter, ViewWillEnter} from '@ionic/angular';

@Component({
    selector: 'app-house-deals',
    templateUrl: './deals.page.html',
    styleUrls: ['./deals.page.scss'],
})
export class DealsPage implements OnInit, OnDestroy, ViewDidEnter {

    house$: Observable<House>;
    house?: House;
    advertisements: AdvertisementItem[];
    private houseSub: Subscription;

    constructor(private houseService: HouseService,
                private adsService: AdvertisementService) {
    }

    ngOnInit() {
        this.house$ = this.houseService.observeHouse(this.houseService.currentHouseId);
        this.houseSub = this.house$.subscribe((house) => {
            this.house = house;
        });
    }

    ngOnDestroy() {
        this.houseSub.unsubscribe();
    }

    ionViewDidEnter() {
        this.adsService.getAdvertisements()
            .then((items) => this.advertisements = items);
    }

    fakePull($event) {
        setTimeout(() => {
            $event.target.complete();
        }, 350);
    }

    async openUrl(ctaUrl: string) {
        await Browser.open({ url: ctaUrl });
    }
}
