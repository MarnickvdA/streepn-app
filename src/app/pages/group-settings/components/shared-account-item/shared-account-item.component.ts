import {Component, Input, OnInit} from '@angular/core';
import {SharedAccount} from '../../../../models';
import {getMoneyString} from '../../../../utils/firestore-utils';

@Component({
    selector: 'app-shared-account-item',
    templateUrl: './shared-account-item.component.html',
    styleUrls: ['./shared-account-item.component.scss'],
})
export class SharedAccountItemComponent implements OnInit {

    @Input() account: SharedAccount;

    constructor() {
    }

    ngOnInit() {
    }

    get balanceString(): string {
        return getMoneyString(this.account.balance);
    }

}
