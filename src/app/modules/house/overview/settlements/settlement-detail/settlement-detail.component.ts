import {Component, OnDestroy, OnInit} from '@angular/core';
import {House, Settlement} from '@core/models';
import {HouseService, LoggerService} from '@core/services';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {SettlementService} from '@core/services/api/settlement.service';

@Component({
    selector: 'app-settlement-detail',
    templateUrl: './settlement-detail.component.html',
    styleUrls: ['./settlement-detail.component.scss'],
})
export class SettlementDetailComponent implements OnInit, OnDestroy {
    houseId: string;
    house: House;
    settlement?: Settlement;
    settleOrder?: string[];
    private readonly logger = LoggerService.getLogger(SettlementDetailComponent.name);
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
                    this.settlement = this.settlementService.getSettlement(house.id, this.settlementId);

                    if (this.settlement) {
                        this.settleOrder = Object.keys(this.settlement.items).sort((a, b) => {
                            if (this.settlement.items[a].settle > this.settlement.items[b].settle) {
                                return -1;
                            } else if (this.settlement.items[a].settle < this.settlement.items[b].settle) {
                                return 1;
                            } else {
                                return 0;
                            }
                        });
                    }
                }
            });
    }

    ngOnDestroy() {
        this.houseSub.unsubscribe();
        this.routeSub.unsubscribe();
    }
}
