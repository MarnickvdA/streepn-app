import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {LoadingController, NavController} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EventsService} from '../../services/events.service';
import {Capacitor} from '@capacitor/core';
import {TranslateService} from '@ngx-translate/core';
import {UIService} from '../../services/ui.service';
import {StorageService} from '../../services/storage.service';
import {LoggerService} from '../../services/logger.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
    private readonly logger = LoggerService.getLogger(LoginPage.name);

    loginForm: FormGroup;
    private readonly loginHandler;
    isIos: boolean;
    isSubmitted: boolean;

    constructor(private authService: AuthService,
                private navController: NavController,
                private formBuilder: FormBuilder,
                private eventsService: EventsService,
                private translate: TranslateService,
                private loadingController: LoadingController,
                private uiService: UIService,
                private storage: StorageService) {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]]
        });

        this.loginHandler = () => {
            this.navController.navigateRoot('/dashboard');
        };
    }

    ngOnInit() {
        this.isIos = Capacitor.getPlatform() === 'ios';

        this.eventsService
            .subscribe('auth:login', this.loginHandler);

        this.storage.delete('hasOnboarded');
        this.storage.delete('pushToken');
    }

    ngOnDestroy(): void {
        this.eventsService.unsubscribe('auth:login', this.loginHandler);
    }

    get form() {
        return this.loginForm.controls;
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

                this.uiService.showError(this.translate.instant('errors.error'), this.translate.instant('login.errors.unknown-login'));
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

                this.uiService.showError(this.translate.instant('errors.error'), this.translate.instant('login.errors.unknown-login'));
            })
            .finally(() => {
                loading.dismiss();
            });
    }
}
