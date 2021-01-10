import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EMPTY, Observable, Subscription} from 'rxjs';
import {Group} from '@core/models';
import {AnalyticsService, AuthService, GroupService, LoggerService, ProductService, StockService} from '@core/services';
import {AlertController, LoadingController, ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {catchError} from 'rxjs/operators';

@Component({
    selector: 'app-edit-stock',
    templateUrl: './edit-stock.component.html',
    styleUrls: ['./edit-stock.component.scss'],
})
export class EditStockComponent implements OnInit, OnDestroy {
    stockForm: FormGroup;
    isSubmitted: boolean;
    @Input() group$: Observable<Group>;
    group: Group;
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
        this.stockForm = this.formBuilder.group({
            product: ['', [Validators.required]],
            amount: ['', [Validators.required, Validators.min(1)]],
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

    dismiss() {
        this.modalController.dismiss();
    }

    async removeStock() {
        this.isSubmitted = true;

        if (this.stockForm.invalid) {
            return;
        }

        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.deleting'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.stockService.removeStockItem(this.group, this.form.product.value, +this.form.amount.value)
            .pipe(
                catchError(err => {
                    this.logger.error({message: err});
                    loading.dismiss(); // TODO Check if this is necessary.
                    return EMPTY;
                })
            )
            .subscribe((t) => {
                if (t) {
                    this.analytics.logRemoveStock(this.authService.currentUser.uid, this.group.id, t.id);
                }

                loading.dismiss();
                this.dismiss();
            });
    }
}
