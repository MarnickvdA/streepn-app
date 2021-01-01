import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Group} from '../../../core/models';
import {Subscription} from 'rxjs';
import {LoadingController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Location} from '@angular/common';
import {GroupService} from '../../../core/services/group.service';
import {AccountService} from '../../../core/services/account.service';

@Component({
    selector: 'app-new-shared-account',
    templateUrl: './new-shared-account.component.html',
    styleUrls: ['./new-shared-account.component.scss'],
})
export class NewSharedAccountComponent implements OnInit, OnDestroy {
    accountForm: FormGroup;
    isSubmitted: boolean;

    groupId: string;
    private group: Group;
    private groupSub: Subscription;

    constructor(private formBuilder: FormBuilder,
                private accountService: AccountService,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private route: ActivatedRoute,
                private location: Location,
                private groupService: GroupService) {
        this.accountForm = this.formBuilder.group({
            name: ['', [Validators.required]],
        });

        this.route.params.subscribe((params: Params) => {
            this.groupId = params.id;
            this.groupSub = this.groupService.observeGroup(params.id)
                .subscribe(group => {
                    this.group = group;
                });
        });
    }

    get form() {
        return this.accountForm.controls;
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        this.groupSub.unsubscribe();
    }

    async addSharedAccount() {
        this.isSubmitted = true;

        if (this.form.name.value.length < 3) {
            this.form.name.setErrors({
                length: true
            });
        }

        if (this.group.sharedAccounts.find(account => account.name === this.form.name.value)) {
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
            .addSharedAccount(this.group, this.form.name.value)
            .then(() => {
                isSuccessful = true;
            })
            .finally(() => {
                loading.dismiss();

                if (isSuccessful) {
                    this.location.back();
                }
            });
    }
}
