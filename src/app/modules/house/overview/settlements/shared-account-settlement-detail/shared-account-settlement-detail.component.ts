import {Component, OnDestroy, OnInit} from '@angular/core';
import {AccountPayout, House} from '@core/models';
import {SharedAccountSettlement} from '@core/models/settlement';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HouseService} from '@core/services';
import {SettlementService} from '@core/services/api/settlement.service';

@Component({
    selector: 'app-shared-account-settlement-detail',
    templateUrl: './shared-account-settlement-detail.component.html',
    styleUrls: ['./shared-account-settlement-detail.component.scss'],
})
export class SharedAccountSettlementDetailComponent implements OnInit, OnDestroy {
    houseId: string;
    house: House;
    settlement?: SharedAccountSettlement;
    debtors: {
        accountId: string;
        payed: AccountPayout;
    }[] = [];
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
                    this.settlement = this.settlementService.getSharedAccountSettlement(house.id, this.settlementId);
                    this.debtors = [];
                    Object.keys(this.settlement.debtors).forEach(key => {
                        this.debtors.push({
                            accountId: key,
                            payed: this.settlement.debtors[key]
                        });
                    });
                }
            });
    }

    ngOnDestroy() {
        this.houseSub.unsubscribe();
        this.routeSub.unsubscribe();
    }
}
