import {Component, OnDestroy, OnInit} from '@angular/core';
import {AnalyticsService, DealsService, HouseService} from '@core/services';
import {Observable, Subscription} from 'rxjs';
import {House} from '@core/models';
import {DealItem} from '@core/models/deal';
import { Browser } from '@capacitor/browser';
import {ViewDidEnter} from '@ionic/angular';

@Component({
    selector: 'app-house-deals',
    templateUrl: './deals.page.html',
    styleUrls: ['./deals.page.scss'],
})
export class DealsPage implements OnInit, OnDestroy, ViewDidEnter {

    house$: Observable<House>;
    house?: House;
    deals: DealItem[];
    private houseSub: Subscription;

    constructor(private houseService: HouseService,
                private dealsService: DealsService,
                private analyticsService: AnalyticsService) {
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
        this.analyticsService.logDealsPageView();
        this.dealsService.getDeals()
            .then((items) => this.deals = items)
            .finally(() => console.log(this.deals));
    }

    fakePull($event) {
        setTimeout(() => {
            $event.target.complete();
        }, 350);
    }

    async openUrl(deal: DealItem) {
        this.analyticsService.logClickDeal(deal.id);
        await Browser.open({ url: deal.ctaUrl });
    }
}
