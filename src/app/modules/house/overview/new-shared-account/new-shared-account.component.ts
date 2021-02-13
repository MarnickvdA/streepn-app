import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {House} from '@core/models';
import {Observable, Subscription} from 'rxjs';
import {LoadingController, ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {AccountService} from '@core/services';

@Component({
    selector: 'app-new-shared-account',
    templateUrl: './new-shared-account.component.html',
    styleUrls: ['./new-shared-account.component.scss'],
})
export class NewSharedAccountComponent implements OnInit, OnDestroy {
    accountForm: FormGroup;
    isSubmitted: boolean;

    @Input() house$: Observable<House>;
    private house: House;
    private houseSub: Subscription;

    constructor(private formBuilder: FormBuilder,
                private accountService: AccountService,
                private loadingController: LoadingController,
                private modalController: ModalController,
                private translate: TranslateService) {
        this.accountForm = this.formBuilder.group({
            name: ['', [Validators.required]],
        });
    }

    get form() {
        return this.accountForm.controls;
    }

    ngOnInit() {
        this.houseSub = this.house$.subscribe((house => {
            this.house = house;
        }));
    }

    ngOnDestroy(): void {
        this.houseSub.unsubscribe();
    }

    async addSharedAccount() {
        this.isSubmitted = true;

        if (this.form.name.value.length < 3) {
            this.form.name.setErrors({
                length: true
            });
        }

        if (this.house.sharedAccounts.find(account => account.name === this.form.name.value)) {
            this.form.name.setErrors({
                conflict: true
            });
        }

        if (this.accountForm.invalid) {
            return;
        }

        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.adding'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        let isSuccessful = false;
        this.accountService
            .addSharedAccount(this.house, this.form.name.value)
            .then(() => {
                isSuccessful = true;
            })
            .finally(() => {
                loading.dismiss();

                if (isSuccessful) {
                    this.dismiss();
                }
            });
    }

    dismiss() {
        this.modalController.dismiss();
    }
}
