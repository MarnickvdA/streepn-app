import {Component, Input, OnInit} from '@angular/core';
import {UserAccount} from '@core/models';
import {getMoneyString} from '@core/utils/firestore-utils';
import {TranslateService} from '@ngx-translate/core';
import {NavController} from '@ionic/angular';
import {AuthService} from '@core/services';

@Component({
    selector: 'app-user-account-item',
    templateUrl: './user-account-item.component.html',
    styleUrls: ['./user-account-item.component.scss'],
})
export class UserAccountItemComponent implements OnInit {

    ownsAccount: boolean;
    @Input() account: UserAccount;
    @Input() canEditAccount = false;
    @Input() navLink?: string;

    constructor(private translate: TranslateService,
                private authService: AuthService,
                private navController: NavController) {
    }

    ngOnInit() {
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
