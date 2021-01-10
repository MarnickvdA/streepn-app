import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {EventsService, GroupService} from '@core/services';
import {Group} from '@core/models';
import {AddTransactionComponent} from '@modules/group/add-transaction/add-transaction.component';
import {ModalController} from '@ionic/angular';
import {Capacitor} from '@capacitor/core';

@Component({
    selector: 'app-group',
    templateUrl: './group.page.html',
    styleUrls: ['./group.page.scss'],
})
export class GroupPage implements OnInit {

    group$: Observable<Group>;
    private routeSub: Subscription;
    private groupSub: Subscription;
    iOS: boolean;

    constructor(private route: ActivatedRoute,
                private groupService: GroupService,
                private modalController: ModalController,
                private events: EventsService) {
        this.iOS = Capacitor.isNative && Capacitor.platform === 'ios';
    }

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params: Params) => {
            this.groupService.currentGroupId = params.id;
            this.group$ = this.groupService.observeGroup(params.id);
            this.groupSub = this.group$.subscribe(group => {
                this.groupService.currentGroup = group;
            });
        });
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
                    }
                });
        });
    }
}
