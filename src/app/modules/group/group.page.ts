import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {EventsService, GroupService} from '@core/services';
import {Group} from '@core/models';
import {AddTransactionComponent} from '@modules/group/add-transaction/add-transaction.component';
import {ModalController} from '@ionic/angular';
import {Capacitor, KeyboardInfo, Plugins} from '@capacitor/core';

const {Keyboard} = Plugins;

@Component({
    selector: 'app-group',
    templateUrl: './group.page.html',
    styleUrls: ['./group.page.scss'],
})
export class GroupPage implements OnInit {

    group$: Observable<Group>;
    private routeSub: Subscription;
    iOS: boolean;
    fabVisible = true;

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
        });

        if (Capacitor.isPluginAvailable('Keyboard')) {
            Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
                this.fabVisible = false;
            });

            Keyboard.addListener('keyboardWillHide', () => {
                this.fabVisible = true;
            });
        }
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
