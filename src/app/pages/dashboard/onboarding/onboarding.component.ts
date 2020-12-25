import {Component, OnInit, ViewChild} from '@angular/core';
import {IonSlides, LoadingController, ModalController} from '@ionic/angular';
import {PushService} from '../../../services/push.service';
import {UserService} from '../../../services/user.service';
import {TranslateService} from '@ngx-translate/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {StorageService} from '../../../services/storage.service';
import {GroupService} from '../../../services/group.service';
import {EventsService} from '../../../services/events.service';
import {Group} from '../../../models';

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
    group: Group;

    constructor(private modalController: ModalController,
                private pushService: PushService,
                private userService: UserService,
                public translate: TranslateService,
                private formBuilder: FormBuilder,
                private loadingController: LoadingController,
                private storage: StorageService,
                private groupService: GroupService,
                private events: EventsService) {
        this.nameForm = this.formBuilder.group({
            name: ['', [Validators.required]],
        });
    }

    ngOnInit() {
        const n = this.userService.user.displayName;
        if (n && n.length > 1) {
            this.name = ' ' + this.userService.user.displayName;
        }

        this.storage.get('groupInvite')
            .then((invite: string) => {
                this.checkGroupInvite(invite);
            })
            .catch(() => {
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

        this.userService.setName(this.nameForm.controls.name.value)
            .then(() => {
                this.slideNext();
            })
            .finally(() => {
                loading.dismiss();
            });
    }

    private checkGroupInvite(groupInvite: string) {
        // Fuck this item, don't want it more than once.
        this.storage.delete('groupInvite');

        this.groupService.getGroupByInviteLink(groupInvite)
            .then(group => {
                if (!group.members.find(uid => uid === this.userService.user.uid)) {
                    this.group = group;
                }
            });
    }

    async joinGroup(groupId: string) {
        const loading = await this.loadingController.create({
            message: this.translate.instant('actions.joining'),
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        this.groupService.joinGroup(groupId, this.userService.user);

        const joinedGroupFn = () => {
            loading.dismiss();
            this.slideNext();
        };

        this.events.subscribe('group:joined', joinedGroupFn);
    }
}
