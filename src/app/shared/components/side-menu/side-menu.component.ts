import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Group} from '@core/models';
import {AuthService, EventsService, GroupService, StorageService} from '@core/services';
import {Capacitor, Plugins, StatusBarStyle} from '@capacitor/core';
import {AlertController, LoadingController, MenuController, NavController} from '@ionic/angular';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faAdjust, faList, faSignOut, faUserCog} from '@fortawesome/pro-duotone-svg-icons';
import {faStar} from '@fortawesome/pro-light-svg-icons';
import {faStar as faStarSolid} from '@fortawesome/pro-solid-svg-icons';
import {environment} from '@env/environment';
import {TranslateService} from '@ngx-translate/core';

const {StatusBar} = Plugins;

@Component({
    selector: 'app-side-menu',
    templateUrl: './side-menu.component.html',
    styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit, OnDestroy {

    @Input() contentId: string;
    private userSub: Subscription;
    groups$: Observable<Group[]>;
    isDarkMode: boolean;
    favorite: string;
    appVersion = environment.version;

    constructor(private authService: AuthService,
                private groupService: GroupService,
                private storage: StorageService,
                private events: EventsService,
                private navController: NavController,
                private alertController: AlertController,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private menuController: MenuController,
                private iconLibrary: FaIconLibrary) {
        this.iconLibrary.addIcons(faList, faUserCog, faAdjust, faStar, faStarSolid, faSignOut);
    }

    ngOnInit() {
        this.storage.get('darkMode')
            .then((darkMode: boolean) => {
                this.isDarkMode = darkMode;
            })
            .catch(() => {
            });

        this.storage.get('favorite')
            .then((favorite: string) => {
                this.favorite = favorite;
            })
            .catch(() => {
            });

        this.userSub = this.authService.user
            .subscribe((user) => {
                if (user) {
                    this.groups$ = this.groupService.observeGroups(user.uid);
                }
            });

        this.events.subscribe('auth:logout', () => {
            if (this.menuController.isOpen()) {
                this.menuController.close();
            }
        });
    }

    ngOnDestroy() {
        this.userSub.unsubscribe();
    }

    onClick(event) {
        document.body.classList.toggle('dark', event.detail.checked);
        this.storage.set('darkMode', event.detail.checked);

        if (Capacitor.isPluginAvailable('StatusBar')) {
            StatusBar.setStyle({
                style: event.detail.checked ? StatusBarStyle.Dark : StatusBarStyle.Light
            });

            if (event.detail.checked) {
                StatusBar.setBackgroundColor({color: '#000000'});
            } else {
                StatusBar.setBackgroundColor({color: '#FFFFFF'});
            }
        }
    }

    toggleFavorite(event: MouseEvent, groupId: string) {
        event.stopPropagation();
        event.preventDefault();

        if (this.favorite === groupId) {
            this.favorite = undefined;
            this.storage.delete('favorite');
        } else {
            this.favorite = groupId;
            this.storage.set('favorite', groupId)
                .catch(() => {
                });
        }
    }

    async logOut() {
        const alert = await this.alertController.create({
            header: this.translate.instant('actions.logout'),
            message: this.translate.instant('side-menu.logout.description'),
            buttons: [
                {
                    text: this.translate.instant('actions.cancel'),
                    role: 'cancel'
                }, {
                    text: this.translate.instant('actions.yes'),
                    handler: async () => {
                        const loading = await this.loadingController.create({
                            message: this.translate.instant('actions.updating'),
                            translucent: true,
                            backdropDismiss: false
                        });

                        await loading.present();

                        this.authService.logout()
                            .then(() => {
                                this.navController.navigateRoot('/login');
                            })
                            .finally(() => {
                                loading.dismiss();
                            });
                    }
                }
            ]
        });

        await alert.present();
    }
}
