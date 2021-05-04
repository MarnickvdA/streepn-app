import {Component, OnDestroy, OnInit} from '@angular/core';
import {HouseService} from '@core/services';
import {Observable, Subscription} from 'rxjs';
import {House} from '@core/models';

@Component({
    selector: 'app-house-deals',
    templateUrl: './deals.page.html',
    styleUrls: ['./deals.page.scss'],
})
export class DealsPage implements OnInit, OnDestroy {

    house$: Observable<House>;
    house?: House;
    private houseSub: Subscription;

    constructor(private houseService: HouseService) {
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

    fakePull($event) {
        setTimeout(() => {
            $event.target.complete();
        }, 350);
    }
}
