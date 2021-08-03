import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {House} from '@core/models';
import {AuthService, EventsService, HouseService, StorageService} from '@core/services';
import {AlertController, LoadingController, MenuController, NavController} from '@ionic/angular';
import {environment} from '@env/environment';
import {TranslateService} from '@ngx-translate/core';
import {Capacitor} from '@capacitor/core';
import {StatusBar, Style} from '@capacitor/status-bar';
import { AppLauncher } from '@capacitor/app-launcher';

@Component({
    selector: 'app-side-menu',
    templateUrl: './side-menu.component.html',
    styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit, OnDestroy {

    @Input() contentId: string;
    houses$: Observable<House[]>;
    isDarkMode: boolean;
    favorite: string;
    appVersion = environment.version;
    private userSub: Subscription;

    constructor(private authService: AuthService,
                private houseService: HouseService,
                private storage: StorageService,
                private events: EventsService,
                private navController: NavController,
                private alertController: AlertController,
                private loadingController: LoadingController,
                private translate: TranslateService,
                private menuController: MenuController) {
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
                    this.houses$ = this.houseService.observeHouses(user.uid);
                }
            });

        this.events.subscribe('auth:logout', () => {
            if (this.menuController.isOpen()) {
                this.menuController.close();
            }
        });
    }

    ngOnDestroy() {
        this.userSub?.unsubscribe();
    }

    onClick(event) {
        document.body.classList.toggle('dark', event.detail.checked);
        this.storage.set('darkMode', event.detail.checked);

        if (Capacitor.isPluginAvailable('StatusBar')) {
            StatusBar.setStyle({
                style: event.detail.checked ? Style.Dark : Style.Light
            });

            if (Capacitor.getPlatform() === 'android') {
                if (event.detail.checked) {
                    StatusBar.setBackgroundColor({color: '#000000'});
                } else {
                    StatusBar.setBackgroundColor({color: '#FFFFFF'});
                }
            }
        }
    }

    toggleFavorite(event: MouseEvent, houseId: string) {
        event.stopPropagation();
        event.preventDefault();

        if (this.favorite === houseId) {
            this.favorite = undefined;
            this.storage.delete('favorite');
        } else {
            this.favorite = houseId;
            this.storage.set('favorite', houseId)
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

    async openSupport() {
        await AppLauncher.openUrl({ url: 'mailto:support@streepn.nl'});
    }
}
