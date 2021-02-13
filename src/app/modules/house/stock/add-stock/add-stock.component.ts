import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Account, House} from '@core/models';
import {AlertController, LoadingController, ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {EMPTY, Observable, Subscription} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {AnalyticsService, AuthService, HouseService, LoggerService, ProductService, StockService} from '@core/services';

@Component({
    selector: 'app-add-stock',
    templateUrl: './add-stock.component.html',
    styleUrls: ['./add-stock.component.scss', '../stock.page.scss'],
})
export class AddStockComponent implements OnInit, OnDestroy {
    stockForm: FormGroup;
    isSubmitted: boolean;
    paidByTitle: string;
    @Input() house$: Observable<House>;
    house: House;
    selectedName: string;
    private readonly logger = LoggerService.getLogger(AddStockComponent.name);
    private houseSub: Subscription;
    private moneyInputInitialized = false;

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
                private analytics: AnalyticsService,
                private stockService: StockService) {
        this.stockForm = this.formBuilder.group({
            product: ['', [Validators.required]],
            cost: ['', [Validators.required, Validators.min(0), Validators.max(10000_00)]],
            amount: ['', [Validators.required, Validators.min(1), Validators.max(10000)]],
            paidBy: ['', [Validators.required, Validators.minLength(1)]],
        });

        this.paidByTitle = this.translate.instant('house.stock.add.paidByTitle');
    }

    get form() {
        return this.stockForm.controls;
    }

    get selectedAccount(): Account | undefined {
        const selectedAccount = this.form.paidBy.value;
        if (selectedAccount?.length > 0) {
            return this.house.getAccountById(selectedAccount);
        } else {
            return undefined;
        }
    }

    ngOnInit() {
        this.houseSub = this.house$.subscribe((house => {
            this.house = house;
        }));
    }

    ngOnDestroy(): void {
        this.houseSub.unsubscribe();
    }

    amountChanged($event: number) {
        if (this.moneyInputInitialized) {
            this.form.cost.setValue($event);
        } else {
            this.moneyInputInitialized = true;
        }
    }

    dismiss(updated?: boolean) {
        this.modalController.dismiss(updated);
    }

    async addStock() {
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

        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.adding'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.stockService.addStockItem(this.house, this.form.product.value, +this.form.cost.value,
            +this.form.amount.value, this.selectedAccount.id)
            .pipe(
                catchError(err => {
                    this.logger.error({message: err});
                    loading.dismiss(); // TODO Check if this is necessary.
                    return EMPTY;
                })
            )
            .subscribe((t) => {
                if (t) {
                    this.analytics.logAddStock(this.authService.currentUser.uid, this.house.id, t.id);
                }

                loading.dismiss();
                this.dismiss(true);
            });
    }

    updateSelectedName() {
        this.selectedName = this.selectedAccount?.name;
    }
}
