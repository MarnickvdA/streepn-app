import {Injectable} from '@angular/core';
import {House, Settlement, settlementConverter} from '@core/models';
import {map} from 'rxjs/operators';
import {AngularFireFunctions} from '@angular/fire/functions';
import {AngularFirestore} from '@angular/fire/firestore';
import {LoggerService} from '@core/services/logger.service';
import {AngularFirePerformance, trace} from '@angular/fire/performance';
import {HouseService} from '@core/services';
import {Observable, throwError} from 'rxjs';
import {AccountSettlement, HouseSettlement, SharedAccountSettlement, UserAccountSettlement} from '@core/models/settlement';

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

    settleUserAccount(houseId: string, settlerAccountId: string, receiverAccountId: string) {
        const house = this.houseService.getLatestHouseValue(houseId);
        if (!house) {
            return throwError('House not found');
        }

        if (house.isSettling) {
            return throwError('House is being settled');
        }

        if (!house.getUserAccountById(settlerAccountId)) {
            return throwError('Shared account not found');
        }

        const callable = this.functions.httpsCallable('settleUserAccount');
        return callable({
            houseId,
            settlerAccountId,
            receiverAccountId,
        }).pipe(
            trace('settleUserAccount')
        );
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
            trace('settleSharedAccount')
        );
    }

    settleHouse(house: House): Observable<any> {
        if (!house.isSettleable) {
            return throwError('House is not settleable');
        }

        const callable = this.functions.httpsCallable('settleHouse');
        return callable({
            houseId: house.id,
        }).pipe(
            trace('settleHouse')
        );
    }

    getHouseSettlement(houseId: string, settlementId: string): HouseSettlement {
        if (this.houseId === houseId) {
            return this.settlements?.filter((s) => s.type === 'house')
                .find((s) => s.id === settlementId) as HouseSettlement;
        } else {
            delete this.settlements;
            return undefined;
        }
    }

    getUserAccountSettlement(houseId: string, settlementId: string): UserAccountSettlement {
        if (this.houseId === houseId) {
            return this.settlements?.filter((s) => s.type === 'userAccount')
                .find((s) => s.id === settlementId) as UserAccountSettlement;
        } else {
            delete this.settlements;
            return undefined;
        }
    }

    getSharedAccountSettlement(houseId: string, settlementId: string): SharedAccountSettlement {
        if (this.houseId === houseId) {
            return this.settlements?.filter((s) => s.type === 'sharedAccount')
                .find((s) => s.id === settlementId) as SharedAccountSettlement;
        } else {
            delete this.settlements;
            return undefined;
        }
    }

    setSettlements(houseId: string, settlements: Settlement[]) {
        this.houseId = houseId;
        this.settlements = settlements;
    }
}
