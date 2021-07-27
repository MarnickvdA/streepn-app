import {Component, Input, OnInit} from '@angular/core';
import {Account, House, Product} from '@core/models';
import {LoadingController, ModalController} from '@ionic/angular';
import {catchError} from 'rxjs/operators';
import {EMPTY, Observable, Subscription} from 'rxjs';
import {TransactionService, TransactionSet} from '@core/services';
import {TranslateService} from '@ngx-translate/core';
import {Capacitor} from '@capacitor/core';
import {Haptics, ImpactStyle} from '@capacitor/haptics';
import {InfoModalComponent} from '@shared/components/info-modal/info-modal.component';
import {addTransactionGuide} from '@shared/app-guides';

@Component({
    selector: 'app-add-transaction',
    templateUrl: './add-transaction.component.html',
    styleUrls: ['./add-transaction.component.scss'],
})
export class AddTransactionComponent implements OnInit {
    @Input() house$: Observable<House>;

    transactions: TransactionSet = {};
    house: House;
    currentProduct: Product;
    transactionCount = 0;

    private houseSub: Subscription;

    constructor(private modalController: ModalController,
                private transactionService: TransactionService,
                private loadingController: LoadingController,
                private translate: TranslateService) {
    }

    ngOnInit() {
        this.houseSub = this.house$.subscribe((house) => {
            this.house = house;

            if (house) {
                this.currentProduct = house.products[0];
            }
        });
    }

    selectProduct($event: any) {
        this.currentProduct = this.house.products.find(p => p.id === $event.detail.value);
    }

    addItem(account: Account) {
        if (Capacitor.isNativePlatform()) {
            Haptics.impact({
                style: ImpactStyle.Heavy
            });
        }

        if (!this.transactions[account.id]) {
            this.transactions[account.id] = {};
        }

        if (!this.transactions[account.id][this.currentProduct.id]) {
            this.transactions[account.id][this.currentProduct.id] = {
                amount: 0,
            };
        }

        this.transactions[account.id][this.currentProduct.id].amount++;

        this.transactionCount++;
    }

    addOneForAll() {
        this.house.accounts.forEach(acc => {
            this.addItem(acc);
        });
    }

    async checkout() {
        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.streeping'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.transactionService.addTransaction(this.house, this.transactions)
            .pipe(
                catchError(err => {
                    loading.dismiss();
                    return EMPTY;
                })
            )
            .subscribe(() => {
                loading.dismiss();
                this.dismiss(true);
            });
    }

    dismiss(successful?: boolean) {
        this.modalController.dismiss(successful);
    }

    removeItem(account: Account) {
        if (Capacitor.isNativePlatform()) {
            Haptics.impact({
                style: ImpactStyle.Medium
            });
        }

        this.transactions[account.id][this.currentProduct.id].amount -= 1;
        this.transactionCount -= 1;
    }

    reset() {
        this.transactions = {};
        this.transactionCount = 0;
    }

    openInfo() {
        InfoModalComponent.presentModal(
            this.modalController,
            'house.transactions.add',
            addTransactionGuide
        );
    }
}
