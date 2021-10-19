import {Component, OnDestroy, OnInit} from '@angular/core';
import {House, Settlement} from '@core/models';
import {AuthService, HouseService, LoggerService, PushService, StorageService} from '@core/services';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {ModalController} from '@ionic/angular';
import {SettleHouseComponent} from '@modules/house/overview/settlements/settle-house/settle-house.component';
import {SettlementService} from '@core/services/api/settlement.service';
import {HouseSettlement, SharedAccountSettlement, UserAccountSettlement} from '@core/models/settlement';

@Component({
    selector: 'app-settlements',
    templateUrl: './settlements.page.html',
    styleUrls: ['./settlements.page.scss'],
})
export class SettlementsPage implements OnInit, OnDestroy {
    houseId: string;
    house: House;
    settlements: Settlement[];
    isAdmin: boolean;
    private readonly logger = LoggerService.getLogger(SettlementsPage.name);
    private houseSub: Subscription;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private houseService: HouseService,
                private settlementService: SettlementService,
                private authService: AuthService,
                private pushService: PushService,
                private storage: StorageService,
                private modalController: ModalController) {
    }

    ngOnInit() {
        this.houseId = this.houseService.currentHouseId;
        this.houseSub = this.houseService.observeHouse(this.houseId)
            .subscribe(house => {
                this.house = house;

                if (house) {
                    this.settlementService.getSettlements(house.id)
                        .then(settlements => {
                            this.settlements = settlements;
                        });
                    this.isAdmin = house.isAdmin(this.authService.currentUser.uid);
                }
            });
    }

    ngOnDestroy() {
        this.houseSub.unsubscribe();
    }

    settleHouse() {
        this.modalController.create({
            component: SettleHouseComponent,
        }).then(modal => modal.present());
    }

    openSettlement(settlement: Settlement) {
        console.log(settlement);
    }

    canSettle() {
        return this.house?.members.length > 1 && this.house?.totalOut > 0;
    }

    getHouseSettlement(settlement: Settlement): HouseSettlement {
        return settlement as HouseSettlement;
    }

    getSharedAccountSettlement(settlement: Settlement): SharedAccountSettlement {
        return settlement as SharedAccountSettlement;
    }

    getUserAccountSettlement(settlement: Settlement): UserAccountSettlement {
        return settlement as UserAccountSettlement;
    }
}
