import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {House, SharedAccount} from '@core/models';
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {HouseService} from '@core/services';

@Component({
    selector: 'app-shared-account-item',
    templateUrl: './shared-account-item.component.html',
    styleUrls: ['./shared-account-item.component.scss'],
})
export class SharedAccountItemComponent implements OnInit, OnDestroy {

    @Input() account: SharedAccount;
    @Input() canEditAccount = false;
    @Output() clicked: EventEmitter<any> = new EventEmitter();

    house?: House;
    hasCallback: boolean;
    private houseSub: Subscription;

    constructor(private translate: TranslateService,
                private houseService: HouseService) {
    }

    ngOnInit() {
        this.houseSub = this.houseService.observeHouse(this.houseService.currentHouseId)
            .subscribe((house) => {
                this.house = house;
            });
    }

    ngOnDestroy(): void {
        this.houseSub.unsubscribe();
    }

    onClick() {
        this.clicked.emit();
    }
}
