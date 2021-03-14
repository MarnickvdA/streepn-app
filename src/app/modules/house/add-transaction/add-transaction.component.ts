import {Component, Input, OnInit} from '@angular/core';
import {Account, House, Product} from '@core/models';
import {LoadingController, ModalController} from '@ionic/angular';
import {Capacitor, HapticsImpactStyle, Plugins} from '@capacitor/core';
import {catchError} from 'rxjs/operators';
import {EMPTY, Observable, Subscription} from 'rxjs';
import {LoggerService, TransactionService, TransactionSet} from '@core/services';
import {TranslateService} from '@ngx-translate/core';

const {Haptics} = Plugins;

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
    private readonly logger = LoggerService.getLogger(AddTransactionComponent.name);

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

    selectProduct($event: CustomEvent) {
        this.currentProduct = this.house.products.find(p => p.id === $event.detail.value);
    }

    addItem(account: Account) {
        if (Capacitor.isNative) {
            Haptics.impact({
                style: HapticsImpactStyle.Heavy
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
        if (Capacitor.isNative) {
            Haptics.impact({
                style: HapticsImpactStyle.Medium
            });
        }

        this.transactions[account.id][this.currentProduct.id].amount -= 1;
        this.transactionCount -= 1;
    }

    reset() {
        this.transactions = {};
        this.transactionCount = 0;
    }
}
