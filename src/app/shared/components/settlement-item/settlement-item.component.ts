import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Settlement} from '@core/models';

@Component({
    selector: 'app-settlement-item',
    templateUrl: './settlement-item.component.html',
    styleUrls: ['./settlement-item.component.scss'],
})
export class SettlementItemComponent implements OnInit {

    @Input() settlement: Settlement;

    constructor() {
    }

    ngOnInit() {
    }
}
