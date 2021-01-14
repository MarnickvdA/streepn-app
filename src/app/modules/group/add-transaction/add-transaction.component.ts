import {Component, Input, OnInit} from '@angular/core';
import {Account, Group, Product, Transaction} from '@core/models';
import {LoadingController, ModalController} from '@ionic/angular';
import {Capacitor, HapticsImpactStyle, Plugins} from '@capacitor/core';
import {catchError} from 'rxjs/operators';
import {EMPTY, Observable, Subscription} from 'rxjs';
import {AdsService, AnalyticsService, AuthService, LoggerService, TransactionService, TransactionSet, UserService} from '@core/services';
import {TranslateService} from '@ngx-translate/core';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faShoppingCart} from '@fortawesome/pro-regular-svg-icons';

const {Haptics} = Plugins;

@Component({
    selector: 'app-add-transaction',
    templateUrl: './add-transaction.component.html',
    styleUrls: ['./add-transaction.component.scss'],
})
export class AddTransactionComponent implements OnInit {
    @Input() group$: Observable<Group>;
    transactions: TransactionSet = {};
    group: Group;
    currentProduct: Product;
    transactionCount = 0;
    private groupSub: Subscription;
    private readonly logger = LoggerService.getLogger(AddTransactionComponent.name);

    constructor(private modalController: ModalController,
                private transactionService: TransactionService,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private userService: UserService,
                private analyticsService: AnalyticsService,
                private authService: AuthService,
                private ads: AdsService,
                private iconLibrary: FaIconLibrary) {
        this.iconLibrary.addIcons(faShoppingCart);
    }

    ngOnInit() {
        this.groupSub = this.group$.subscribe((group) => {
            this.group = group;

            if (group) {
                this.currentProduct = group.products[0];
            }
        });

        this.ads.preloadInterstitial();
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

    addOneForAll() {
        this.group.accounts.forEach(acc => {
            this.addItem(acc);
        });
    }

    async checkout() {
        this.ads.showInterstitial();
        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.streeping'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.transactionService.addTransaction(this.group, this.transactions)
            .pipe(
                catchError(err => {
                    this.logger.error({message: err});
                    loading.dismiss(); // TODO Check if this is necessary.
                    return EMPTY;
                })
            )
            .subscribe((t) => {
                if (t) {
                    this.analyticsService.logTransaction(this.authService.currentUser.uid, this.group.id, t.id);
                }

                loading.dismiss();
                this.dismiss(t);
            });
    }

    dismiss(data?: Transaction) {
        this.modalController.dismiss(data);
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
