import {Component, Input, OnInit} from '@angular/core';
import {Account, Group, Product, Transaction} from '../../../models';
import {LoadingController, ModalController} from '@ionic/angular';
import {Capacitor, HapticsImpactStyle, Plugins} from '@capacitor/core';
import {TransactionService} from '../../../services/transaction.service';
import {catchError} from 'rxjs/operators';
import {EMPTY} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../../services/user.service';

const {Haptics} = Plugins;

@Component({
    selector: 'app-add-transaction',
    templateUrl: './add-transaction.component.html',
    styleUrls: ['./add-transaction.component.scss'],
})
export class AddTransactionComponent implements OnInit {

    @Input() group: Group;
    transactions: {
        [accountId: string]: {
            [accountId: string]: {
                amount: number;
            }
        }
    } = {};
    currentProduct: Product;
    canCheckout = false;

    private loading?: HTMLIonLoadingElement;

    constructor(private modalController: ModalController,
                private transactionService: TransactionService,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private userService: UserService) {
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

        this.canCheckout = true;
    }

    checkout() {
        const productDictionary: { [productId: string]: Product } = {};
        this.group.products.forEach(p => {
            productDictionary[p.id] = p;
        });

        const accountDictionary: { [accountId: string]: Account } = {};
        this.group.accounts.forEach(a => {
            accountDictionary[a.id] = a;
        });

        const transactionList: Transaction[] = [];
        const currentUserAccount = this.group.accounts.find(acc => acc.userId === this.userService.user.uid);

        Object.keys(this.transactions).forEach(accountId => {
            const account = accountDictionary[accountId];

            Object.keys(this.transactions[accountId]).forEach(productId => {
                const product = productDictionary[productId];
                const amount = this.transactions[accountId][productId].amount;

                const transaction = new Transaction(undefined, undefined, amount, amount * product.price,
                    currentUserAccount.name, currentUserAccount.id, account, product);

                transactionList.push(transaction);
            });
        });

        this.showLoading();

        this.transactionService.addTransaction(this.group.id, transactionList)
            .pipe(
                catchError(err => {
                    console.error(err);
                    this.loading?.dismiss();
                    return EMPTY;
                })
            )
            .subscribe((value) => {
                this.dismiss(value);
            });
    }

    dismiss(data?: Transaction[]) {
        this.loading?.dismiss();

        this.modalController.dismiss(data);
    }

    async showLoading() {
        this.loading = await this.loadingController.create({
            message: this.translate.instant('actions.streeping'),
            translucent: true,
            backdropDismiss: false
        });

        await this.loading.present();

        this.loading.onDidDismiss()
            .then(() => {
                this.loading = undefined;
            });
    }
}
