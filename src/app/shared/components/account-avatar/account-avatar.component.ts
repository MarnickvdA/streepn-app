import {Component, Input, OnInit} from '@angular/core';
import {toPastelColor} from '@core/utils/string-to-hsl';
import {Account} from '@core/models';

@Component({
    selector: 'app-account-avatar',
    templateUrl: './account-avatar.component.html',
    styleUrls: ['./account-avatar.component.scss'],
})
export class AccountAvatarComponent implements OnInit {

    @Input()
    photoUrl?: string;

    @Input()
    seed?: string;

    @Input()
    size: 'small' | 'normal' | 'large' = 'normal';

    color: string;

    constructor() {
    }

    ngOnInit() {
        this.color = toPastelColor(this.seed);
    }
}
