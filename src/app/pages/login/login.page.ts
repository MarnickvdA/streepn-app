import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {NavController} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EventsService} from '../../services/events.service';
import {Capacitor, Plugins} from '@capacitor/core';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
    loginForm: FormGroup;
    private loginHandler;
    isIos: boolean;

    constructor(private authService: AuthService,
                private navController: NavController,
                private formBuilder: FormBuilder,
                private eventsService: EventsService) {
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
    }

    ngOnDestroy(): void {
        this.eventsService.unsubscribe('auth:login', this.loginHandler);
    }


    login() {
        this.authService.login(this.loginForm.controls.email.value, this.loginForm.controls.password.value);
    }

    async loginWithApple() {
        try {
            this.authService.loginWithApple();
        } catch (e) {
            console.error(e);
        }
    }
}
