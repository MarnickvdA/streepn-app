import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {House, UserAccount} from '@core/models';
import {TranslateService} from '@ngx-translate/core';
import {NavController} from '@ionic/angular';
import {AuthService, HouseService} from '@core/services';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-user-account-item',
    templateUrl: './user-account-item.component.html',
    styleUrls: ['./user-account-item.component.scss'],
})
export class UserAccountItemComponent implements OnInit, OnDestroy {

    ownsAccount: boolean;
    @Input() account: UserAccount;
    @Input() canEditAccount = false;
    @Input() navLink?: string;

    house?: House;
    private houseSub: Subscription;

    constructor(private translate: TranslateService,
                private houseService: HouseService,
                private authService: AuthService,
                private navController: NavController) {
    }

    ngOnInit() {
        this.houseSub = this.houseService.observeHouse(this.houseService.currentHouseId)
            .subscribe((house) => {
                this.house = house;
            });
    }

    ngOnDestroy(): void {
        this.houseSub.unsubscribe();
    }

    openAccount() {
        if (this.canEditAccount) {
            this.navController.navigateForward(this.navLink, {
                state: {
                    account: this.account
                }
            });
        }
    }
}
