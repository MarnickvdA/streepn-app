import {Injectable} from '@angular/core';
import {House, Settlement} from '@core/models';
import {HouseService} from '@core/services';
import {Observable, throwError} from 'rxjs';
import {AccountSettlement, HouseSettlement, SharedAccountSettlement, UserAccountSettlement} from '@core/models/settlement';
import {Functions, httpsCallable} from '@angular/fire/functions';
import {Performance, trace} from '@angular/fire/performance';

@Injectable({
    providedIn: 'root'
})
export class SettlementService {
    private settlements?: Settlement[];
    private houseId: string;

    constructor(private houseService: HouseService,
                private functions: Functions,
                private performance: Performance) {
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

        const settleUserAccountFn = httpsCallable(this.functions, 'settleUserAccount');
        return settleUserAccountFn.call({
            houseId,
            settlerAccountId,
            receiverAccountId,
        }).pipe(
            trace(this.performance, 'settleUserAccount')
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

        httpsCallable(this.functions, 'settleSharedAccount').call({
            houseId,
            sharedAccountId,
            settlement,
        }).pipe(
            trace(this.performance, 'settleSharedAccount')
        );
    }

    settleHouse(house: House): Observable<any> {
        if (!house.isSettleable) {
            return throwError('House is not settleable');
        }

        httpsCallable(this.functions, 'settleHouse').call({
            houseId: house.id,
        }).pipe(
            trace(this.performance, 'settleHouse')
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
