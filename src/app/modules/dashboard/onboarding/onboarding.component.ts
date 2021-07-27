import {Component, OnInit, ViewChild} from '@angular/core';
import {IonSlides, LoadingController, ModalController} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HouseInvite} from '@core/models';
import {environment} from '@env/environment';
import {AuthService, EventsService, HouseService, PushService, StorageService, UIService} from '@core/services';
import {TranslateService} from '@ngx-translate/core';
import {Browser} from '@capacitor/browser';

@Component({
    selector: 'app-onboarding',
    templateUrl: './onboarding.component.html',
    styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent implements OnInit {
    @ViewChild(IonSlides) slides: IonSlides;
    slideOpts = {
        initialSlide: 0,
        speed: 400,
        allowSlideNext: false,
        allowSlidePrev: false,
    };
    name: string;
    nameForm: FormGroup;
    isSubmitted: boolean;
    houseInvite: HouseInvite;
    hasAcceptedLegals = false;

    constructor(private modalController: ModalController,
                private pushService: PushService,
                public authService: AuthService,
                public translate: TranslateService,
                private formBuilder: FormBuilder,
                private loadingController: LoadingController,
                private storage: StorageService,
                private houseService: HouseService,
                private events: EventsService,
                private uiService: UIService) {
        this.nameForm = this.formBuilder.group({
            name: ['', [Validators.required]],
        });
    }

    ngOnInit() {
        const n = this.authService.currentUser?.displayName;
        if (n && n.length > 1) {
            this.name = ' ' + this.authService.currentUser.displayName;
        }

        this.storage.get('houseInvite')
            .then((invite: string) => {
                this.checkHouseInvite(invite);
            })
            .catch(() => {
            });

        this.authService.hasAcceptedLegals.subscribe(accepted => {
            this.hasAcceptedLegals = accepted;
        });
    }

    initPushNotifications() {
        this.pushService.initialize()
            .then(granted => {
            })
            .finally(() => {
                this.slideNext();
            });
    }

    dismiss() {
        this.storage.set('hasOnboarded', true);

        this.modalController.dismiss();
    }

    slideNext() {
        this.slides.lockSwipes(false);
        this.slides.slideNext(this.slideOpts.speed);
        this.slides.lockSwipes(true);
    }

    async submitName() {
        this.isSubmitted = true;

        if (this.nameForm.invalid) {
            return;
        }

        const loading = await this.loadingController.create({
            backdropDismiss: false,
            message: this.translate.instant('actions.saving')
        });

        await loading.present();

        this.authService.setName(this.nameForm.controls.name.value)
            .then(() => {
                this.slideNext();
            })
            .finally(() => {
                loading.dismiss();
            });
    }

    async acceptTerms() {
        const loading = await this.loadingController.create({
            backdropDismiss: false,
            message: this.translate.instant('actions.saving')
        });

        await loading.present();

        const terms = (accepted) => {
            if (accepted) {
                this.slideNext();
            } else {
                this.uiService.showError(
                    this.translate.instant('errors.error'),
                    this.translate.instant('onboarding.legal.error')
                );
            }

            loading.dismiss();

            this.events.unsubscribe('legal:result', terms);
        };

        this.events.subscribe('legal:result', terms);

        this.authService.acceptTerms();
    }

    async joinHouse() {
        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.joining'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        const joinedHouseFn = () => {
            loading.dismiss();
            this.slideNext();
        };

        this.events.subscribe('house:joined', joinedHouseFn);

        this.houseService.joinHouse(this.houseInvite, this.authService.currentUser);
    }

    openLegalPage() {
        Browser.open({
            url: environment.legalUrl
        });
    }

    private checkHouseInvite(houseInvite: string) {
        // Fuck this item, don't want it more than once.
        this.storage.delete('houseInvite');

        this.houseService.getHouseByInviteLink(houseInvite)
            .then(invite => {
                this.houseInvite = invite;
            })
            .catch(err => {
                this.uiService.showError(this.translate.instant('errors.error'), err);
            });
    }
}
