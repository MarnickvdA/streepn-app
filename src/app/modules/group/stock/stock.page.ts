import {Component, OnDestroy, OnInit} from '@angular/core';
import {AddStockComponent} from '@modules/group/stock/add-stock/add-stock.component';
import {ModalController} from '@ionic/angular';
import {AuthService, GroupService} from '@core/services';
import {Observable, Subscription} from 'rxjs';
import {Group, Product} from '@core/models';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faEdit, faHistory} from '@fortawesome/pro-duotone-svg-icons';
import {NewProductComponent} from '@modules/group/stock/new-product/new-product.component';

@Component({
    selector: 'app-group-stock',
    templateUrl: './stock.page.html',
    styleUrls: ['./stock.page.scss'],
})
export class StockPage implements OnInit, OnDestroy {

    group: Group;
    private group$: Observable<Group>;
    private groupSub: Subscription;
    stockProducts: Product[];
    isAdmin: boolean;

    constructor(private modalController: ModalController,
                private groupService: GroupService,
                private iconLibrary: FaIconLibrary,
                private authService: AuthService) {
        this.iconLibrary.addIcons(faEdit, faHistory);
    }

    ngOnInit() {
        this.group$ = this.groupService.observeGroup(this.groupService.currentGroupId);
        this.groupSub = this.group$
            .subscribe(group => {
                this.group = group;

                if (group) {
                    this.stockProducts = group.products.filter(p => !isNaN(p.stock));
                    this.isAdmin = group.isAdmin(this.authService.currentUser.uid);
                }
            });
    }

    ngOnDestroy() {
        this.groupSub.unsubscribe();
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

    addProduct() {
        this.modalController.create({
            component: NewProductComponent,
            componentProps: {
                group$: this.group$
            },
            swipeToClose: true
        }).then((modal) => {
            modal.present();
        });
    }
}
