import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {EventsService, GroupService} from '@core/services';
import {Group} from '@core/models';
import {AddTransactionComponent} from '@modules/group/add-transaction/add-transaction.component';
import {ModalController, NavController} from '@ionic/angular';
import {Capacitor} from '@capacitor/core';
import {faPlus} from '@fortawesome/pro-regular-svg-icons';
import {faBoxFull, faCogs, faHouse, faInventory, faReceipt} from '@fortawesome/pro-duotone-svg-icons';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-group',
    templateUrl: './group.page.html',
    styleUrls: ['./group.page.scss'],
})
export class GroupPage implements OnInit, OnDestroy {

    group$: Observable<Group>;
    private routeSub: Subscription;
    iOS: boolean;
    private group: Group;
    private groupSub: Subscription;

    constructor(private route: ActivatedRoute,
                private groupService: GroupService,
                private modalController: ModalController,
                private events: EventsService,
                private library: FaIconLibrary,
                private navController: NavController) {
        this.library.addIcons(faPlus, faHouse, faReceipt, faInventory, faCogs);
        this.iOS = Capacitor.isNative && Capacitor.platform === 'ios';
    }

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params: Params) => {
            this.groupService.currentGroupId = params.id;
            this.group$ = this.groupService.observeGroup(params.id);

            this.groupSub = this.group$.subscribe((group) => {
                this.group = group;
            });
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
        this.groupSub.unsubscribe();
    }

    addTransaction() {
        this.modalController.create({
            component: AddTransactionComponent,
            componentProps: {
                group$: this.group$
            },
            swipeToClose: true,
        }).then((modal) => {
            modal.present();
            modal.onWillDismiss()
                .then((callback) => {
                    if (callback.data) {
                        this.events.publish('transactions:update');
                        this.navController.navigateRoot(['group', this.group?.id, 'transactions']);
                    }
                });
        });
    }
}
