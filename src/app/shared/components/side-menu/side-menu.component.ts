import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Group} from '@core/models';
import {AuthService, EventsService, GroupService, StorageService} from '@core/services';
import {Capacitor, Plugins, StatusBarStyle} from '@capacitor/core';
import {MenuController} from '@ionic/angular';

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

    constructor(private authService: AuthService,
                private groupService: GroupService,
                private storage: StorageService,
                private events: EventsService,
                private menuController: MenuController) {
    }

    ngOnInit() {
        this.storage.get('darkMode')
            .then((darkMode: boolean) => {
                this.isDarkMode = darkMode;
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
}
