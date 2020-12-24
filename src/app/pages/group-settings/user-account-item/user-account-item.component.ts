import {Component, Input, OnInit} from '@angular/core';
import {UserAccount} from '../../../models';
import {getMoneyString} from '../../../utils/firestore-utils';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-user-account-item',
    templateUrl: './user-account-item.component.html',
    styleUrls: ['./user-account-item.component.scss'],
})
export class UserAccountItemComponent implements OnInit {

    @Input() account: UserAccount;

    constructor(private translate: TranslateService) {
    }

    ngOnInit() {
    }

    get balanceString(): string {
        return `€ ${getMoneyString(this.account.balance, this.translate.currentLang)}`;
    }
}
