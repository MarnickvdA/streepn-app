import {Component, OnDestroy, OnInit} from '@angular/core';
import {Group, Settlement} from '@core/models';
import {AuthService, GroupService, LoggerService, PushService, StorageService} from '@core/services';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faCalculatorAlt} from '@fortawesome/pro-duotone-svg-icons';
import {ModalController} from '@ionic/angular';
import {SettleGroupComponent} from '@modules/group/overview/settlements/settle-group/settle-group.component';
import {SettlementService} from '@core/services/settlement.service';

@Component({
    selector: 'app-settlements',
    templateUrl: './settlements.page.html',
    styleUrls: ['./settlements.page.scss'],
})
export class SettlementsPage implements OnInit, OnDestroy {
    groupId: string;
    group: Group;

    private readonly logger = LoggerService.getLogger(SettlementsPage.name);
    private groupSub: Subscription;
    settlements: Settlement[];

    constructor(private router: Router,
                private route: ActivatedRoute,
                private groupService: GroupService,
                private settlementService: SettlementService,
                private authService: AuthService,
                private pushService: PushService,
                private storage: StorageService,
                private iconLibary: FaIconLibrary,
                private modalController: ModalController) {
        this.iconLibary.addIcons(faCalculatorAlt);
    }

    ngOnInit() {
        this.groupId = this.groupService.currentGroupId;
        this.groupSub = this.groupService.observeGroup(this.groupId)
            .subscribe(group => {
                this.group = group;

                if (group) {
                    this.settlementService.getSettlements(group.id)
                        .then(settlements => {
                            this.settlements = settlements;
                        });
                }
            });
    }

    ngOnDestroy() {
        this.groupSub.unsubscribe();
    }

    settleGroup() {
        this.modalController.create({
            component: SettleGroupComponent,
        }).then(modal => {
            return modal.present();
        });
    }

    openSettlement(settlement: Settlement) {
        console.log(settlement);
    }
}
