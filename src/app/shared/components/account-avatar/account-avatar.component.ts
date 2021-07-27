import {Component, Input, OnInit} from '@angular/core';
import {toHSL} from '@core/utils/string-to-hex';
import {UserAccount} from '@core/models';

@Component({
    selector: 'app-account-avatar',
    templateUrl: './account-avatar.component.html',
    styleUrls: ['./account-avatar.component.scss'],
})
export class AccountAvatarComponent implements OnInit {

    @Input()
    account: UserAccount;

    @Input()
    size: 'small' | 'normal' | 'large' = 'normal';

    constructor() {
    }

    ngOnInit() {
    }

    accountIdToColor(id) {
        return toHSL(id);
    }
}