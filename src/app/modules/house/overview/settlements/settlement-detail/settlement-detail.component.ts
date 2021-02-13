import {Component, OnDestroy, OnInit} from '@angular/core';
import {House, Settlement} from '@core/models';
import {AuthService, HouseService, LoggerService, PushService, StorageService} from '@core/services';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {SettlementService} from '@core/services/settlement.service';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faClock} from '@fortawesome/pro-duotone-svg-icons';

@Component({
    selector: 'app-settlement-detail',
    templateUrl: './settlement-detail.component.html',
    styleUrls: ['./settlement-detail.component.scss'],
})
export class SettlementDetailComponent implements OnInit, OnDestroy {
    private readonly logger = LoggerService.getLogger(SettlementDetailComponent.name);

    houseId: string;
    house: House;

    private houseSub: Subscription;
    private routeSub: Subscription;
    private settlementId: string;
    settlement?: Settlement;
    settleOrder?: string[];

    constructor(private router: Router,
                private route: ActivatedRoute,
                private houseService: HouseService,
                private settlementService: SettlementService,
                private authService: AuthService,
                private pushService: PushService,
                private storage: StorageService,
                private iconLibary: FaIconLibrary) {
        this.iconLibary.addIcons(faClock);

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
