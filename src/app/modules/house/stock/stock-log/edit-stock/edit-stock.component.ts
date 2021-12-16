import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EMPTY, Observable, Subscription} from 'rxjs';
import {Account, House, Stock} from '@core/models';
import {AnalyticsService, AuthService, HouseService, LoggerService, ProductService, StockService} from '@core/services';
import {AlertController, LoadingController, ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {catchError} from 'rxjs/operators';
import {MoneyInputComponent} from '@shared/components/money-input/money-input.component';
import {AlertService} from '@core/services/alert.service';

@Component({
    selector: 'app-edit-stock',
    templateUrl: './edit-stock.component.html',
    styleUrls: ['./edit-stock.component.scss', '../../stock.page.scss'],
})
export class EditStockComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input()
    house$: Observable<House>;

    @Input()
    stockItem: Stock;

    @ViewChild(MoneyInputComponent)
    moneyInput: MoneyInputComponent;

    stockForm: FormGroup;
    isSubmitted: boolean;
    paidByTitle: string;

    house: House;
    selectedAccount: Account;
    private readonly logger = LoggerService.getLogger(EditStockComponent.name);
    private houseSub: Subscription;

    constructor(private formBuilder: FormBuilder,
                private productService: ProductService,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private route: ActivatedRoute,
                private location: Location,
                private houseService: HouseService,
                private alertController: AlertController,
                private modalController: ModalController,
                private authService: AuthService,
                private alertService: AlertService,
                private analytics: AnalyticsService,
                private stockService: StockService) {
        this.paidByTitle = this.translate.instant('house.stock.add.paidByTitle');
    }

    get form() {
        return this.stockForm.controls;
    }

    ngOnInit() {
        this.stockForm = this.formBuilder.group({
            product: [this.stockItem.productId, [Validators.required]],
            amount: [this.stockItem.amount, [Validators.required, Validators.min(1), Validators.max(10000)]],
            cost: [this.stockItem.cost, [Validators.required, Validators.min(0), Validators.max(10000_00)]],
            paidBy: [this.stockItem.paidById, [Validators.required, Validators.minLength(1)]],
        });

        this.houseSub = this.house$.subscribe((house => {
            this.house = house;

            if (house) {
                this.updatePayout();
            }
        }));
    }

    ngOnDestroy(): void {
        this.houseSub.unsubscribe();
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

        this.updatePayout();

        this.submitForm('editing', this.form.product.value, +this.form.cost.value,
            +this.form.amount.value, this.selectedAccount?.id);
    }

    updatePayout() {
        this.selectedAccount = this.house.getAccountById(this.form.paidBy.value);
    }

    removeStock() {
        this.updatePayout();

        this.submitForm('removing', '', 0, 0, undefined);
    }

    private async submitForm(action: 'editing' | 'removing', productId: string, cost: number, amount: number,
                             paidBy: string) {
        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.' + action),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.stockService.editStockItem(this.house, this.stockItem, productId, cost, amount, paidBy)
            .pipe(
                catchError(err => {
                    this.alertService.promptApiError(err.message);
                    loading.dismiss();
                    return EMPTY;
                })
            )
            .subscribe((t) => {
                if (t) {
                    this.analytics.logAddStock(this.house.id, t.id);
                }

                loading.dismiss();
                this.dismiss(true);
            });
    }
}
