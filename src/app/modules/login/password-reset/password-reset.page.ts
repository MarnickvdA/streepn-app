import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AlertService, AuthService, EventsService, LoggerService, StorageService} from '@core/services';
import {LoadingController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {AppErrorMessage} from '@core/services/alert.service';

@Component({
    selector: 'app-password-reset',
    templateUrl: './password-reset.page.html',
    styleUrls: ['./password-reset.page.scss'],
})
export class PasswordResetPage implements OnInit, OnDestroy {
    emailFormGroup: FormGroup;
    passwordResetFormGroup: FormGroup;
    resetRequestFormSubmitted: boolean;
    passwordResetFormSubmitted: boolean;
    resetCode = undefined;
    requestFormSuccess = false;
    isLoadingRequest = false;

    private readonly resumeHandler;
    private readonly logger = LoggerService.getLogger(PasswordResetPage.name);

    constructor(private authService: AuthService,
                private navController: NavController,
                private formBuilder: FormBuilder,
                private storage: StorageService,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private eventsService: EventsService,
                private zone: NgZone,
                private alertService: AlertService) {
        this.emailFormGroup = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
        });

        this.passwordResetFormGroup = this.formBuilder.group({
            password: ['', [Validators.required]],
            passwordAgain: ['', [Validators.required]]
        });

        this.resumeHandler = () => {
            this.storage.get('passwordResetCode')
                .catch(() => {})
                .then((code: string) => {
                    this.zone.run(() => {
                        this.resetCode = code;
                    });

                    this.storage.delete('passwordResetCode');
                });
        };
    }

    ngOnInit() {
        this.eventsService.subscribe('app:resume', this.resumeHandler);
    }

    ngOnDestroy() {
        this.eventsService.unsubscribe('app:resume', this.resumeHandler);
    }

    get emailForm() {
        return this.emailFormGroup.controls;
    }

    get passwordResetForm() {
        return this.passwordResetFormGroup.controls;
    }

    get canResetPassword() {
        return this.resetCode !== undefined;
    }

    async submitResetForm() {
        this.resetRequestFormSubmitted = true;

        if (this.emailFormGroup.invalid) {
            return;
        }

        this.isLoadingRequest = true;

        this.authService.requestPasswordReset(this.emailForm.email.value)
            .then(() => {
                // Continue with the password reset.
                this.requestFormSuccess = true;
            })
            .catch(errorCode => {
                switch (errorCode) {
                    case 'auth/invalid-email':
                        this.emailForm.email.setErrors({
                            invalid: true
                        });
                        break;
                    case 'auth/user-not-found':
                        this.emailForm.email.setErrors({
                            unknown: true
                        });
                        break;
                    default:
                        this.logger.error({
                            message: 'Could not process fpassword reset',
                            error: errorCode
                        });
                }
            })
            .finally(() => this.isLoadingRequest = false);
    }

    async resetPassword() {
        this.passwordResetFormSubmitted = true;

        if (this.passwordResetForm.password.value !== this.passwordResetForm.passwordAgain.value) {
            this.passwordResetForm.passwordAgain.setErrors({
                different: true
            });
            return;
        }

        if (this.passwordResetFormGroup.invalid) {
            return;
        }

        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.updating'),
            backdropDismiss: false,
        });

        await loading.present();

        this.authService.resetPassword(this.resetCode, this.passwordResetForm.password.value)
            .then(() => {
                // Continue with the password reset.
                this.navController.back();
            })
            .catch(errorCode => {
                switch (errorCode) {
                    case 'auth/expired-action-code':
                        this.alertService.promptAppError(AppErrorMessage.expiredPasswordResetCode);
                        break;
                    case 'auth/invalid-action-code':
                        this.alertService.promptAppError(AppErrorMessage.invalidPasswordResetCode);
                        break;
                    case 'auth/user-disabled':
                        this.alertService.promptAppError(AppErrorMessage.userDisabled);
                        break;
                    case 'auth/user-not-found':
                        this.alertService.promptAppError(AppErrorMessage.userNotFound);
                        break;
                    case 'auth/weak-password':
                        this.passwordResetForm.password.setErrors({
                            weak: true
                        });
                        break;
                    default:
                        this.alertService.promptAppError(AppErrorMessage.unknown, { errorCode });
                }
            })
            .finally(() => loading.dismiss());
    }
}
