import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Group} from '../../../core/models';
import {ProductService} from '../../../core/services/product.service';
import {LoadingController, ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {GroupService} from '../../../core/services/group.service';
import {EMPTY, Observable, Subscription} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {StockService} from '../../../core/services/stock.service';
import {AuthService} from '../../../core/services/auth.service';
import {LoggerService} from '../../../core/services/logger.service';
import {AnalyticsService} from '../../../core/services/analytics.service';

@Component({
    selector: 'app-add-stock',
    templateUrl: './add-stock.component.html',
    styleUrls: ['./add-stock.component.scss'],
})
export class AddStockComponent implements OnInit, OnDestroy {
    private readonly logger = LoggerService.getLogger(AddStockComponent.name);

    stockForm: FormGroup;
    isSubmitted: boolean;

    @Input() group$: Observable<Group>;

    group: Group;
    private groupSub: Subscription;
    private moneyInputInitialized = false;

    constructor(private formBuilder: FormBuilder,
                private productService: ProductService,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private route: ActivatedRoute,
                private location: Location,
                private groupService: GroupService,
                private modalController: ModalController,
                private authService: AuthService,
                private analytics: AnalyticsService,
                private stockService: StockService) {
        this.stockForm = this.formBuilder.group({
            product: ['', [Validators.required]],
            cost: ['', [Validators.required, Validators.min(0), Validators.max(10000_00)]],
            amount: ['', [Validators.required, Validators.min(1), Validators.max(10000)]]
        });
    }

    get form() {
        return this.stockForm.controls;
    }

    ngOnInit() {
        this.groupSub = this.group$.subscribe((group => {
            this.group = group;
        }));
    }

    ngOnDestroy(): void {
        this.groupSub.unsubscribe();
    }

    amountChanged($event: number) {
        if (this.moneyInputInitialized) {
            this.form.cost.setValue($event);
        } else {
            this.moneyInputInitialized = true;
        }
    }

    dismiss() {
        this.modalController.dismiss();
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

        setTimeout(() => {
            loading.dismiss();
        }, 1000);

        this.stockService.addStockItem(this.group, this.form.product.value, +this.form.cost.value, +this.form.amount.value)
            .pipe(
                catchError(err => {
                    this.logger.error({message: err});
                    loading.dismiss(); // TODO Check if this is necessary.
                    return EMPTY;
                })
            )
            .subscribe((t) => {
                if (t) {
                    this.analytics.logAddStock(this.authService.currentUser.uid, this.group.id, t.id);
                }

                loading.dismiss();
                this.dismiss();
            });
    }
}
