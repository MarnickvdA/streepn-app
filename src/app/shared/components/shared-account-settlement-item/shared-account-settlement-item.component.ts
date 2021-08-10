import {Component, Input, OnInit} from '@angular/core';
import {SharedAccountSettlement} from '@core/models/settlement';

@Component({
    selector: 'app-shared-account-settlement-item',
    templateUrl: './shared-account-settlement-item.component.html',
    styleUrls: ['./shared-account-settlement-item.component.scss'],
})
export class SharedAccountSettlementItemComponent implements OnInit {

    @Input() settlement: SharedAccountSettlement;

    constructor() {
    }

    ngOnInit() {
    }

}
