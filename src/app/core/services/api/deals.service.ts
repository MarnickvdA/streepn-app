import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {LoggerService} from '@core/services';
import {dealsConverter, DealItem} from '@core/models/deal';

@Injectable({
    providedIn: 'root'
})
export class DealsService {
    private readonly logger = LoggerService.getLogger(DealsService.name);

    constructor(private fs: AngularFirestore) {
    }

    getDeals(): Promise<DealItem[]> {
        return this.fs.collection('deals')
            .doc('v1')
            .ref
            .withConverter(dealsConverter)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.exists) {
                    return querySnapshot.data().items ?? [];
                } else {
                    return [];
                }
            })
            .catch(err => {
                this.logger.error({message: 'getDeals', error: err});
                return [];
            });
    }
}
