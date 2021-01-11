import {Component, Input, OnInit} from '@angular/core';
import {SharedAccount} from '@core/models';
import {getMoneyString} from '@core/utils/firestore-utils';
import {NavController} from '@ionic/angular';

@Component({
    selector: 'app-shared-account-item',
    templateUrl: './shared-account-item.component.html',
    styleUrls: ['./shared-account-item.component.scss'],
})
export class SharedAccountItemComponent implements OnInit {

    @Input() account: SharedAccount;
    @Input() canEditAccount = false;
    @Input() navLink?: string;

    constructor(private navController: NavController) {
    }

    get balanceString(): string {
        return getMoneyString(this.account.balance);
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
