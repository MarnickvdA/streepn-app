import {Injectable} from '@angular/core';
import {Group, Settlement, settlementConverter} from '@core/models';
import {map} from 'rxjs/operators';
import {AngularFireFunctions} from '@angular/fire/functions';
import {AngularFirestore} from '@angular/fire/firestore';
import {LoggerService} from '@core/services/logger.service';

@Injectable({
    providedIn: 'root'
})
export class SettlementService {
    private readonly logger = LoggerService.getLogger(SettlementService.name);

    constructor(private functions: AngularFireFunctions,
                private fs: AngularFirestore) {
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

    getSettlements(groupId: string): Promise<Settlement[]> {
        return this.fs.collection('groups')
            .doc(groupId)
            .collection('settlements')
            .ref
            .withConverter(settlementConverter)
            .get()
            .then((querySnapshot) => {
                return querySnapshot?.docs?.map(doc => doc.data()) || [];
            })
            .catch(err => {
                this.logger.error({message: 'getSettlements', data: {groupId}, error: err});
                return Promise.reject('get settlements failed'); // FIXME Add error.
            });
    }
}
