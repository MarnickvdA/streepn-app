import {Component, OnDestroy, OnInit} from '@angular/core';
import {HouseService} from '@core/services';
import {Observable, Subscription} from 'rxjs';
import {House} from '@core/models';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faMinusCircle, faPlusCircle} from '@fortawesome/pro-duotone-svg-icons';
import {AngularFirestore} from '@angular/fire/firestore';

@Component({
    selector: 'app-house-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

    house$: Observable<House>;
    house?: House;
    private houseSub: Subscription;

    constructor(private houseService: HouseService,
                private fs: AngularFirestore,
                private iconLibrary: FaIconLibrary) {
        this.iconLibrary.addIcons(faPlusCircle, faMinusCircle);
    }

    ngOnInit() {
        this.house$ = this.houseService.observeHouse(this.houseService.currentHouseId);
        this.houseSub = this.house$.subscribe((house) => {
            this.house = house;
        });
    }

    ngOnDestroy() {
        this.houseSub.unsubscribe();
    }
}
