import {Injectable} from '@angular/core';
import {House, Settlement, settlementConverter} from '@core/models';
import {map} from 'rxjs/operators';
import {AngularFireFunctions} from '@angular/fire/functions';
import {AngularFirestore} from '@angular/fire/firestore';
import {LoggerService} from '@core/services/logger.service';
import {AngularFirePerformance, trace} from '@angular/fire/performance';
import {HouseService} from '@core/services';
import {Observable, throwError} from 'rxjs';
import {AccountSettlement, HouseSettlement} from '@core/models/settlement';

@Injectable({
    providedIn: 'root'
})
export class SettlementService {
    private readonly logger = LoggerService.getLogger(SettlementService.name);
    private settlements?: Settlement[];
    private houseId: string;

    constructor(private houseService: HouseService,
                private functions: AngularFireFunctions,
                private performance: AngularFirePerformance,
                private fs: AngularFirestore) {
    }

    settleSharedAccount(houseId: string, sharedAccountId: string, settlement: AccountSettlement): Observable<any> {
        const house = this.houseService.getLatestHouseValue(houseId);
        if (!house) {
            return throwError('House not found');
        }

        if (house.isSettling) {
            return throwError('House is being settled');
        }

        if (!house.getSharedAccountById(sharedAccountId)) {
            return throwError('Shared account not found');
        }

        const callable = this.functions.httpsCallable('settleSharedAccount');
        return callable({
            houseId,
            sharedAccountId,
            settlement,
        }).pipe(
            trace('settleSharedAccount'),
            map(result => {
                console.log(result);
            }));
    }

    settleHouse(house: House): Observable<any> {
        if (!house.isSettleable) {
            return throwError('House is not settleable');
        }

        const callable = this.functions.httpsCallable('settleHouse');
        return callable({
            houseId: house.id,
        }).pipe(
            trace('settleHouse'),
            map(result => {
                console.log(result);
            }));
    }

    getSettlement(houseId: string, settlementId: string): HouseSettlement {
        if (this.houseId === houseId) {
            return this.settlements?.filter((s) => s.type === 'house')
                .find((s) => s.id === settlementId) as HouseSettlement;
        } else {
            delete this.settlements;
            return undefined;
        }
    }

    getSettlements(houseId: string): Promise<Settlement[]> {
        return this.fs.collection('houses')
            .doc(houseId)
            .collection('settlements')
            .ref
            .withConverter(settlementConverter)
            .orderBy('createdAt', 'desc')
            .get()
            .then((querySnapshot) => {
                this.houseId = houseId;
                this.settlements = querySnapshot?.docs?.map(doc => doc.data()) || [];
                return this.settlements;
            })
            .catch(err => {
                this.logger.error({message: 'getSettlements', data: {houseId}, error: err});
                return Promise.reject('get settlements failed'); // FIXME Add error.
            });
    }
}
