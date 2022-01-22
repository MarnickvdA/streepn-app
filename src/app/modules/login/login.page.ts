import {Component, OnDestroy, OnInit} from '@angular/core';
import {LoadingController, ModalController, NavController} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Capacitor} from '@capacitor/core';
import {TranslateService} from '@ngx-translate/core';
import {AuthService, EventsService, LoggerService, StorageService} from '@core/services';
import {InfoModalComponent} from '@shared/components/info-modal/info-modal.component';
import {loginPageGuide} from '@shared/components/info-modal/info-guides';
import {AlertService, AppErrorMessage} from '@core/services/alert.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
    loginForm: FormGroup;
    isIos: boolean;
    isSubmitted: boolean;
    private readonly logger = LoggerService.getLogger(LoginPage.name);
    private readonly loginHandler;

    constructor(private authService: AuthService,
                private navController: NavController,
                private formBuilder: FormBuilder,
                private eventsService: EventsService,
                private translate: TranslateService,
                private loadingController: LoadingController,
                private alertService: AlertService,
                private storage: StorageService,
                private modalController: ModalController) {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]]
        });

        this.loginHandler = () => {
            this.navController.navigateRoot('/dashboard');
        };
    }

    get form() {
        return this.loginForm.controls;
    }

    ngOnInit() {
        this.isIos = Capacitor.getPlatform() === 'ios';

        this.eventsService.subscribe('auth:login', this.loginHandler);

        // this.storage.delete('hasOnboarded');
        this.storage.delete('pushToken');
    }

    ngOnDestroy(): void {
        this.eventsService.unsubscribe('auth:login', this.loginHandler);
    }

    async login() {
        this.isSubmitted = true;

        if (this.loginForm.invalid) {
            return;
        }

        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.login') + '...',
            backdropDismiss: false,
        });

        await loading.present();

        this.authService.login(this.loginForm.controls.email.value, this.loginForm.controls.password.value)
            .catch(errorCode => {
                switch (errorCode) {
                    case 'auth/invalid-email':
                        this.form.email.setErrors({
                            invalid: true
                        });
                        break;
                    case 'auth/user-disabled':
                        this.form.email.setErrors({
                            blocked: true
                        });
                        break;
                    case 'auth/user-not-found':
                        this.form.email.setErrors({
                            unknown: true
                        });
                        break;
                    case 'auth/wrong-password':
                        this.form.password.setErrors({
                            wrong: true
                        });
                        break;
                }
            })
            .finally(() => {
                loading.dismiss();
            });
    }

    async loginWithApple() {
        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.login') + '...',
            backdropDismiss: false,
        });

        await loading.present();

        this.authService.loginWithApple()
            .catch(err => {
                this.logger.error({message: err});

                this.alertService.promptAppError(AppErrorMessage.unknownLogin);
            })
            .finally(() => {
                loading.dismiss();
            });
    }

    async loginWithGoogle() {
        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.login') + '...',
            backdropDismiss: false,
        });

        await loading.present();

        this.authService.loginWithGoogle()
            .catch(err => {
                this.logger.error({message: err});

                this.alertService.promptAppError(AppErrorMessage.unknownLogin);
            })
            .finally(() => {
                loading.dismiss();
            });
    }

    openInfo() {
        InfoModalComponent.presentModal(
            this.modalController,
            'login.title',
            loginPageGuide
        );
    }
}
