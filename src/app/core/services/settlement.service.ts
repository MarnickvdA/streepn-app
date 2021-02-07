import {Injectable} from '@angular/core';
import {Group, Settlement, settlementConverter} from '@core/models';
import {map} from 'rxjs/operators';
import {AngularFireFunctions} from '@angular/fire/functions';
import {AngularFirestore} from '@angular/fire/firestore';
import {LoggerService} from '@core/services/logger.service';
import {AccountPayout} from '@core/utils/streepn-logic';

@Injectable({
    providedIn: 'root'
})
export class SettlementService {
    private readonly logger = LoggerService.getLogger(SettlementService.name);
    private settlements?: Settlement[];
    private groupId: string;

    constructor(private functions: AngularFireFunctions,
                private fs: AngularFirestore) {
    }

    settleSharedAccount(groupId: string, sharedAccountId: string, settlement: { [id: string]: AccountPayout }) {
        const callable = this.functions.httpsCallable('settleSharedAccount');
        return callable({
            groupId,
            sharedAccountId,
            settlement,
        }).pipe(
            map(result => {
                console.log(result);
            }));
    }

    settleGroup(group: Group) {
        const callable = this.functions.httpsCallable('settleGroup');
        return callable({
            groupId: group.id,
        }).pipe(
            map(result => {
                console.log(result);
            }));
    }

    getSettlement(groupId: string, settlementId: string): Settlement {
        if (this.groupId === groupId) {
            return this.settlements?.find((s) => s.id === settlementId);
        } else {
            delete this.settlements;
            return undefined;
        }
    }

    getSettlements(groupId: string): Promise<Settlement[]> {
        return this.fs.collection('groups')
            .doc(groupId)
            .collection('settlements')
            .ref
            .withConverter(settlementConverter)
            .orderBy('createdAt', 'desc')
            .get()
            .then((querySnapshot) => {
                this.groupId = groupId;
                this.settlements = querySnapshot?.docs?.map(doc => doc.data()) || [];
                return this.settlements;
            })
            .catch(err => {
                this.logger.error({message: 'getSettlements', data: {groupId}, error: err});
                return Promise.reject('get settlements failed'); // FIXME Add error.
            });
    }
}
