import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {House, Settlement, settlementConverter} from '@core/models';
import {AuthService, EventsService, HouseService, PushService, StorageService} from '@core/services';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {ModalController} from '@ionic/angular';
import {SettleHouseComponent} from '@modules/house/overview/settlements/settle-house/settle-house.component';
import {SettlementService} from '@core/services/api/settlement.service';
import {HouseSettlement, SharedAccountSettlement, UserAccountSettlement} from '@core/models/settlement';
import {AngularFirestore, QueryDocumentSnapshot} from '@angular/fire/firestore';

@Component({
    selector: 'app-settlements',
    templateUrl: './settlements.page.html',
    styleUrls: ['./settlements.page.scss'],
})
export class SettlementsPage implements OnInit, OnDestroy {
    houseId: string;
    house: House;
    settlements: Settlement[];
    doneLoading = false;
    isLoadingMore = false;
    isAdmin: boolean;
    private lastSnapshot: QueryDocumentSnapshot<Settlement>;
    private houseSub: Subscription;
    private readonly limit = 10;
    private readonly refreshSub;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private houseService: HouseService,
                private settlementService: SettlementService,
                private authService: AuthService,
                private pushService: PushService,
                private storage: StorageService,
                private modalController: ModalController,
                private zone: NgZone,
                private fs: AngularFirestore,
                private events: EventsService) {
        this.refreshSub = () => {
            this.zone.run(_ => this.reset());
        };
    }

    ngOnInit() {
        this.houseId = this.houseService.currentHouseId;
        this.houseSub = this.houseService.observeHouse(this.houseId)
            .subscribe(house => {
                this.house = house;

                if (house) {
                    if (!this.settlements) {
                        this.reset();
                    }

                    this.isAdmin = house.isAdmin(this.authService.currentUser.uid);
                }
            });

        this.events.subscribe('house:settlement', this.refreshSub);
    }

    ngOnDestroy() {
        this.houseSub.unsubscribe();
        this.events.unsubscribe('house:settlement', this.refreshSub);
    }

    settleHouse() {
        this.modalController.create({
            component: SettleHouseComponent,
        }).then(modal => modal.present());
    }

    reset(event?) {
        this.zone.run(_ => {
            this.doneLoading = false;
            this.lastSnapshot = undefined;

            this.settlements = [];
            this.loadSettlements(this.house.id)
                .finally(() => {
                    if (event) {
                        event.target.complete();
                    }
                });
        });
    }

    loadNext() {
        this.isLoadingMore = true;
        this.loadSettlements(this.house.id)
            .finally(() => {
                this.zone.run(_ => {
                    this.isLoadingMore = false;
                });
            });
    }

    loadSettlements(houseId: string): Promise<void> {
        if (this.doneLoading) {
            return;
        }

        let ref = this.fs.collection('houses')
            .doc(houseId)
            .collection('settlements')
            .ref
            .withConverter(settlementConverter)
            .orderBy('createdAt', 'desc')
            .limit(this.limit);

        if (this.lastSnapshot) {
            ref = ref.startAfter(this.lastSnapshot);
        }

        return ref.get()
            .then((result) => {
                this.zone.run(_ => {
                    if (result.docs.length < this.limit) {
                        this.doneLoading = true;
                    }

                    if (result.docs.length > 0) {
                        this.lastSnapshot = result.docs[result.docs.length - 1];

                        result.docs.forEach((doc) => {
                            this.settlements.push(doc.data());
                        });
                    }
                });
            });
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
