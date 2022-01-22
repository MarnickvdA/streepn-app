import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {LoggerService} from '@core/services';
import {advertisementConverter, AdvertisementItem} from '@core/models/advertisement';

@Injectable({
    providedIn: 'root'
})
export class AdvertisementService {
    private readonly logger = LoggerService.getLogger(AdvertisementService.name);

    constructor(private fs: AngularFirestore) {
    }

    getAdvertisements(): Promise<AdvertisementItem[]> {
        return this.fs.collection('advertisements')
            .doc('v1')
            .ref
            .withConverter(advertisementConverter)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.exists) {
                    return querySnapshot.data().items ?? [];
                } else {
                    return [];
                }
            })
            .catch(err => {
                this.logger.error({message: 'getAdvertisements', error: err});
                return [];
            });
    }
}
