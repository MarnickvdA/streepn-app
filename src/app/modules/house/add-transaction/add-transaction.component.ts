import {Component, Input, OnInit} from '@angular/core';
import {Account, House, Product} from '@core/models';
import {LoadingController, ModalController, ToastController} from '@ionic/angular';
import {catchError} from 'rxjs/operators';
import {EMPTY, Observable, Subject, Subscription} from 'rxjs';
import {TransactionService, TransactionSet} from '@core/services';
import {TranslateService} from '@ngx-translate/core';
import {Capacitor} from '@capacitor/core';
import {Haptics, ImpactStyle} from '@capacitor/haptics';
import {InfoModalComponent} from '@shared/components/info-modal/info-modal.component';
import {addTransactionGuide} from '@shared/components/info-modal/info-guides';

@Component({
    selector: 'app-add-transaction',
    templateUrl: './add-transaction.component.html',
    styleUrls: ['./add-transaction.component.scss'],
})
export class AddTransactionComponent implements OnInit {
    @Input() house$: Observable<House>;

    transactions: TransactionSet = {};
    productTotals: {
        [productId: string]: number;
    };
    accountQuantityInput: {
        [accountId: string]: {
            set: Subject<number>;
            add: Subject<number>;
            reset: Subject<void>;
        };
    };
    house: House;
    currentProduct: Product;
    transactionCount = 0;

    private houseSub: Subscription;

    constructor(private modalController: ModalController,
                private transactionService: TransactionService,
                private loadingController: LoadingController,
                private toastController: ToastController,
                private translate: TranslateService) {
    }

    ngOnInit() {
        this.houseSub = this.house$.subscribe((house) => {
            this.house = house;

            if (house) {
                this.currentProduct = house.products[0];

                this.productTotals = {};
                this.house.products.forEach(product => this.productTotals[product.id] = 0);

                this.accountQuantityInput = {};
                this.house.allAccounts.forEach((acc) => {
                    this.accountQuantityInput[acc.id] = {
                        set: new Subject<number>(),
                        add: new Subject<number>(),
                        reset: new Subject<void>(),
                    };
                });

            }
        });
    }

    selectProduct(product: Product) {
        this.currentProduct = product;

        if (Capacitor.isNativePlatform()) {
            Haptics.impact({
                style: ImpactStyle.Medium
            });
        }

        this.house.allAccounts.forEach((acc) => {
            if (this.transactions[acc.id] && this.transactions[acc.id][this.currentProduct.id]?.amount) {
                this.accountQuantityInput[acc.id].set.next(this.transactions[acc.id][this.currentProduct.id]?.amount);
            } else {
                this.accountQuantityInput[acc.id].set.next(0);
            }
        });
    }

    addItem(account: Account, by = 1) {
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

        this.transactions[account.id][this.currentProduct.id].amount += by;
        this.productTotals[this.currentProduct.id] += by;
        this.transactionCount += by;
    }

    addOneForAll() {
        this.house.accounts.forEach(acc => {
            this.accountQuantityInput[acc.id].add.next(1);
        });
    }

    async checkout() {
        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.streeping'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        Object.keys(this.transactions).forEach(x => {
            Object.keys(this.transactions[x]).forEach(y => {
                if (this.transactions[x][y].amount === 0) {
                    delete this.transactions[x][y];
                }
            });

            if (Object.values(this.transactions[x]).length === 0) {
                delete this.transactions[x];
            }
        });

        this.transactionService.addTransaction(this.house, this.transactions)
            .pipe(
                catchError(err => {
                    console.error(err);
                    this.toastController.create({
                        message: JSON.stringify(err),
                        duration: 3000,
                    }).then((toast) => toast.present());
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

    removeItem(account: Account, by = 1) {
        if (Capacitor.isNativePlatform()) {
            Haptics.impact({
                style: ImpactStyle.Medium
            });
        }

        this.transactions[account.id][this.currentProduct.id].amount -= by;
        this.productTotals[this.currentProduct.id] -= by;
        this.transactionCount -= by;
    }

    reset() {
        this.house.allAccounts.forEach(acc => {
            this.accountQuantityInput[acc.id].set.next(0);
        });

        this.transactions = {};
        Object.keys(this.productTotals).forEach(key => this.productTotals[key] = 0);
        this.transactionCount = 0;
    }

    openInfo() {
        InfoModalComponent.presentModal(
            this.modalController,
            'house.transactions.add',
            addTransactionGuide
        );
    }

    onValueChange(account: Account, $event: number) {
        if (!this.transactions[account.id] || !this.transactions[account.id][this.currentProduct.id]?.amount) {
            this.addItem(account, $event);
        }

        if (this.transactions[account.id][this.currentProduct.id].amount < $event) {
            this.addItem(account, $event - this.transactions[account.id][this.currentProduct.id].amount);
        } else if (this.transactions[account.id][this.currentProduct.id].amount > $event) {
            this.removeItem(account, this.transactions[account.id][this.currentProduct.id].amount - $event);
        }
    }
}
