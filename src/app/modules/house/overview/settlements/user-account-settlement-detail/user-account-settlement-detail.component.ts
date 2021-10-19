import {Component, OnDestroy, OnInit} from '@angular/core';
import {House} from '@core/models';
import {UserAccountSettlement} from '@core/models/settlement';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HouseService} from '@core/services';
import {SettlementService} from '@core/services/api/settlement.service';

@Component({
    selector: 'app-user-account-settlement-detail',
    templateUrl: './user-account-settlement-detail.component.html',
    styleUrls: ['./user-account-settlement-detail.component.scss'],
})
export class UserAccountSettlementDetailComponent implements OnInit, OnDestroy {
    houseId: string;
    house: House;
    settlement?: UserAccountSettlement;
    private houseSub: Subscription;
    private routeSub: Subscription;
    private settlementId: string;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private houseService: HouseService,
                private settlementService: SettlementService) {

        this.routeSub = this.route.params.subscribe((params: Params) => {
            this.settlementId = params.settlementId;
        });
    }

    ngOnInit() {
        this.houseId = this.houseService.currentHouseId;
        this.houseSub = this.houseService.observeHouse(this.houseId)
            .subscribe(house => {
                this.house = house;

                if (house) {
                    this.settlement = this.settlementService.getUserAccountSettlement(house.id, this.settlementId);
                }
            });
    }

    ngOnDestroy() {
        this.houseSub.unsubscribe();
        this.routeSub.unsubscribe();
    }
}
