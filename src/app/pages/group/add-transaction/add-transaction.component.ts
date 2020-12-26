import {Component, Input, OnInit} from '@angular/core';
import {Account, Group, Product, Transaction} from '../../../models';
import {LoadingController, ModalController} from '@ionic/angular';
import {Capacitor, HapticsImpactStyle, Plugins} from '@capacitor/core';
import {TransactionService} from '../../../services/transaction.service';
import {catchError} from 'rxjs/operators';
import {EMPTY} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../../services/user.service';
import {AnalyticsService} from '../../../services/analytics.service';
import {AuthService} from '../../../services/auth.service';
import {LoggerService} from '../../../services/logger.service';

const {Haptics} = Plugins;

@Component({
    selector: 'app-add-transaction',
    templateUrl: './add-transaction.component.html',
    styleUrls: ['./add-transaction.component.scss'],
})
export class AddTransactionComponent implements OnInit {
    private readonly logger = LoggerService.getLogger(AddTransactionComponent.name);

    @Input() group: Group;
    transactions: {
        [accountId: string]: {
            [productId: string]: {
                amount: number;
            }
        }
    } = {};
    currentProduct: Product;
    transactionCount = 0;

    constructor(private modalController: ModalController,
                private transactionService: TransactionService,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private userService: UserService,
                private analyticsService: AnalyticsService,
                private authService: AuthService) {
    }

    ngOnInit() {
        this.currentProduct = this.group.products[0];
    }

    selectProduct($event: CustomEvent) {
        this.currentProduct = this.group.products.find(p => p.id === $event.detail.value);
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

    async checkout() {
        const productDictionary: { [productId: string]: Product } = {};
        this.group.products.forEach(p => {
            productDictionary[p.id] = p;
        });

        const accountDictionary: { [accountId: string]: Account } = {};
        this.group.accounts.forEach(a => {
            accountDictionary[a.id] = a;
        });
        this.group.sharedAccounts.forEach(a => {
            accountDictionary[a.id] = a;
        });

        const transactionList: Transaction[] = [];
        const currentUserAccount = this.group.accounts.find(acc => acc.userId === this.authService.currentUser.uid);

        Object.keys(this.transactions).forEach(accountId => {
            const account = accountDictionary[accountId];

            Object.keys(this.transactions[accountId]).forEach(productId => {
                const product = productDictionary[productId];
                const amount = this.transactions[accountId][productId].amount;

                if (amount > 0) {
                    const transaction = new Transaction(undefined, undefined, amount, amount * product.price,
                        currentUserAccount.name, currentUserAccount.id, account, product);

                    transactionList.push(transaction);
                }
            });
        });

        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.streeping'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.transactionService.addTransaction(this.group.id, transactionList)
            .pipe(
                catchError(err => {
                    this.logger.error({message: err});
                    loading.dismiss(); // TODO Check if this is necessary.
                    return EMPTY;
                })
            )
            .subscribe((value) => {
                if (value?.length > 0) {
                    this.analyticsService.logTransaction(this.authService.currentUser.uid, this.group.id, value[0].id);
                }

                loading.dismiss();
                this.dismiss(value);
            });
    }

    dismiss(data?: Transaction[]) {
        this.modalController.dismiss(data);
    }

    removeItem(account: Account) {
        this.transactions[account.id][this.currentProduct.id].amount -= 2;
        this.transactionCount -= 2;
    }
}
