import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../core/services/auth.service';
import {LoadingController, NavController} from '@ionic/angular';
import {EventsService} from '../../core/services/events.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit, OnDestroy {
    registerForm: FormGroup;
    isSubmitted: boolean;
    private registerHandler;

    constructor(private authService: AuthService,
                private navController: NavController,
                private formBuilder: FormBuilder,
                private eventsService: EventsService,
                private translate: TranslateService,
                private loadingController: LoadingController) {
        this.registerForm = this.formBuilder.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]]
        });

        this.registerHandler = () => {
            this.navController.navigateRoot('/dashboard');
        };
    }

    get form() {
        return this.registerForm.controls;
    }

    ngOnInit() {
        this.eventsService
            .subscribe('auth:login', this.registerHandler);
    }

    ngOnDestroy(): void {
        this.eventsService.unsubscribe('auth:login', this.registerHandler);
    }

    async register() {
        this.isSubmitted = true;

        if (this.registerForm.invalid) {
            return;
        }

        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.register') + '...',
            backdropDismiss: false,
        });

        await loading.present();

        this.authService.register(this.registerForm.controls.name.value, this.registerForm.controls.email.value,
            this.registerForm.controls.password.value)
            .catch(errorCode => {
                switch (errorCode) {
                    case 'auth/email-already-in-use':
                        this.form.email.setErrors({
                            inUse: true
                        });
                        break;
                    case 'auth/invalid-email':
                        this.form.email.setErrors({
                            invalid: true
                        });
                        break;
                    case 'auth/weak-password':
                        this.form.password.setErrors({
                            weak: true
                        });
                        break;
                }
            })
            .finally(() => {
                loading.dismiss();
            });
    }
}
