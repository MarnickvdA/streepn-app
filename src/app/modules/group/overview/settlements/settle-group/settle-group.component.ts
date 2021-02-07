import {Component, OnDestroy, OnInit} from '@angular/core';
import {Group, SharedAccount} from '@core/models';
import {EventsService, GroupService, LoggerService} from '@core/services';
import {EMPTY, Observable, Subscription} from 'rxjs';
import {LoadingController, ModalController} from '@ionic/angular';
import {SettleComponent} from '@modules/group/overview/shared-account-detail/settle/settle.component';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faCheckCircle, faPlusCircle, faTimesCircle} from '@fortawesome/pro-duotone-svg-icons';
import {AddStockComponent} from '@modules/group/stock/add-stock/add-stock.component';
import {TranslateService} from '@ngx-translate/core';
import {catchError} from 'rxjs/operators';
import {SettlementService} from '@core/services/settlement.service';

@Component({
    selector: 'app-settle-group',
    templateUrl: './settle-group.component.html',
    styleUrls: ['./settle-group.component.scss'],
})
export class SettleGroupComponent implements OnInit, OnDestroy {
    private readonly logger = LoggerService.getLogger(SettleGroupComponent.name);

    group?: Group;
    private groupSub: Subscription;
    private group$: Observable<Group>;

    constructor(private groupService: GroupService,
                private settlementService: SettlementService,
                private modalController: ModalController,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private events: EventsService,
                private iconLibrary: FaIconLibrary) {
        this.iconLibrary.addIcons(faCheckCircle, faTimesCircle, faPlusCircle);
    }

    ngOnInit() {
        this.group$ = this.groupService.observeGroup(this.groupService.currentGroupId);
        this.groupSub = this.group$
            .subscribe(group => {
                this.group = group;
            });
    }

    ngOnDestroy() {
        this.groupSub.unsubscribe();
    }

    settleSharedAccount(account: SharedAccount) {
        this.modalController.create({
            component: SettleComponent,
            componentProps: {
                sharedAccountId: account.id
            },
            swipeToClose: true
        }).then((modal) => {
            modal.present();
        });
    }

    dismiss() {
        this.modalController.dismiss();
    }

    async settleGroup() {
        if (!this.group?.isSettleable) {
            this.logger.error({
                message: 'Cannot settle group, conditions not met!'
            });
        } else {
            const loading = await this.loadingController.create({
                message: this.translate.instant('actions.settling'),
                translucent: true,
                backdropDismiss: false
            });

            await loading.present();

            this.settlementService.settleGroup(this.group)
                .pipe(
                    catchError(err => {
                        this.logger.error({message: err});
                        loading.dismiss();
                        return EMPTY;
                    })
                )
                .subscribe(() => {
                    this.events.publish('group:settlement');
                    loading.dismiss();
                    this.dismiss();
                });
        }
    }

    addStock() {
        this.modalController.create({
            component: AddStockComponent,
            componentProps: {
                group$: this.group$
            },
            swipeToClose: true
        }).then((modal) => {
            modal.present();
        });
    }
}
