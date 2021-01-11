import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EMPTY, Observable, Subscription} from 'rxjs';
import {Account, Group, Stock} from '@core/models';
import {AnalyticsService, AuthService, GroupService, LoggerService, ProductService, StockService} from '@core/services';
import {AlertController, LoadingController, ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {catchError} from 'rxjs/operators';
import {calculatePayout} from '@core/utils/firestore-utils';
import {MoneyInputComponent} from '@shared/components/money-input/money-input.component';

@Component({
    selector: 'app-edit-stock',
    templateUrl: './edit-stock.component.html',
    styleUrls: ['./edit-stock.component.scss', '../stock.page.scss'],
})
export class EditStockComponent implements OnInit, OnDestroy, AfterViewInit {
    stockForm: FormGroup;
    isSubmitted: boolean;
    paidByTitle: string;
    @Input() group$: Observable<Group>;
    @Input() stockItem: Stock;
    @ViewChild(MoneyInputComponent) moneyInput: MoneyInputComponent;

    group: Group;
    allAccounts: Account[];
    paidAmount: number[];
    selectedNames: string;
    private readonly logger = LoggerService.getLogger(EditStockComponent.name);
    private groupSub: Subscription;

    constructor(private formBuilder: FormBuilder,
                private productService: ProductService,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private route: ActivatedRoute,
                private location: Location,
                private groupService: GroupService,
                private alertController: AlertController,
                private modalController: ModalController,
                private authService: AuthService,
                private analytics: AnalyticsService,
                private stockService: StockService) {
        this.paidByTitle = this.translate.instant('group.stock.add.paidByTitle');
    }

    get form() {
        return this.stockForm.controls;
    }

    get selectedAccounts(): Account[] {
        const selectedAccounts = this.form.paidBy.value;
        if (selectedAccounts?.length > 0) {
            return this.allAccounts.filter(acc => selectedAccounts.includes(acc.id)) || [];
        } else {
            return [];
        }
    }

    ngOnInit() {
        this.stockForm = this.formBuilder.group({
            product: [this.stockItem.productId, [Validators.required]],
            amount: [this.stockItem.amount, [Validators.required, Validators.min(1), Validators.max(10000)]],
            cost: [this.stockItem.cost, [Validators.required, Validators.min(0), Validators.max(10000_00)]],
            paidBy: [this.stockItem.paidBy, [Validators.required, Validators.minLength(1)]],
        });

        this.groupSub = this.group$.subscribe((group => {
            this.group = group;

            if (group) {
                this.allAccounts = [...group.accounts, ...group.sharedAccounts];
                this.updatePayout();
            }
        }));
    }

    ngOnDestroy(): void {
        this.groupSub.unsubscribe();
    }

    ngAfterViewInit() {
        this.moneyInput?.setAmount(this.stockItem.cost);
    }

    amountChanged($event: number) {
        this.form.cost.setValue($event);
    }

    dismiss(updated?: boolean) {
        this.modalController.dismiss(updated);
    }

    editStock() {
        this.isSubmitted = true;

        if (this.form.cost.value < 0) {
            this.form.cost.setErrors({
                min: true
            });
        }

        if (this.form.cost.value > 10000_00) {
            this.form.cost.setErrors({
                max: true
            });
        }

        if (this.stockForm.invalid) {
            return;
        }

        this.submitForm('editing', this.form.product.value, +this.form.cost.value,
            +this.form.amount.value, this.selectedAccounts.map(acc => acc.id), this.paidAmount);
    }

    updatePayout() {
        const selected = this.selectedAccounts;

        this.selectedNames = selected?.map(acc => acc.name.trim()).join(', ');

        if (selected?.length > 0) {
            this.paidAmount = calculatePayout(this.form.cost.value, selected.length);
        } else {
            this.paidAmount = [];
        }
    }

    removeStock() {
        this.submitForm('removing', '', 0, 0, [], []);
    }

    private async submitForm(action: 'editing' | 'removing', productId: string, cost: number, amount: number,
                             paidBy: string[], paidAmount: number[]) {
        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.' + action),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.updatePayout();

        this.stockService.editStockItem(this.group, this.stockItem, productId, cost, amount, paidBy, paidAmount)
            .pipe(
                catchError(err => {
                    this.logger.error({message: err});
                    loading.dismiss();
                    return EMPTY;
                })
            )
            .subscribe((t) => {
                if (t) {
                    this.analytics.logAddStock(this.authService.currentUser.uid, this.group.id, t.id);
                }

                loading.dismiss();
                this.dismiss(true);
            });
    }
}
