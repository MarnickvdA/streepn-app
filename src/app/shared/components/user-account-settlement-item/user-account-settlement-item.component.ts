import {Component, Input, OnInit} from '@angular/core';
import {UserAccountSettlement} from '@core/models/settlement';

@Component({
    selector: 'app-user-account-settlement-item',
    templateUrl: './user-account-settlement-item.component.html',
    styleUrls: ['./user-account-settlement-item.component.scss'],
})
export class UserAccountSettlementItemComponent implements OnInit {

    @Input() settlement: UserAccountSettlement;

    constructor() {
    }

    ngOnInit() {
    }

}
