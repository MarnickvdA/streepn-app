import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {NavController} from '@ionic/angular';
import {EventsService} from '../../services/events.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit, OnDestroy {
  registerForm: FormGroup;
  private registerHandler;

  constructor(private authService: AuthService,
              private navController: NavController,
              private formBuilder: FormBuilder,
              private eventsService: EventsService) {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.registerHandler = () => {
      this.navController.navigateRoot('/dashboard');
    };
  }

  ngOnInit() {
    this.eventsService
        .subscribe('auth:login', this.registerHandler);
  }

  ngOnDestroy(): void {
    this.eventsService.unsubscribe('auth:login', this.registerHandler);
  }


  register() {
    this.authService.register(this.registerForm.controls.name.value, this.registerForm.controls.email.value,
        this.registerForm.controls.password.value);
  }
}
