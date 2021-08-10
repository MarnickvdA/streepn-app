import {Component, Input, OnInit} from '@angular/core';
import {HouseSettlement} from '@core/models/settlement';

@Component({
    selector: 'app-house-settlement-item',
    templateUrl: './house-settlement-item.component.html',
    styleUrls: ['./house-settlement-item.component.scss'],
})
export class HouseSettlementItemComponent implements OnInit {

    @Input() settlement: HouseSettlement;

    constructor() {
    }

    ngOnInit() {
    }
}
