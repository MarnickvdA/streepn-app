import {Injectable} from '@angular/core';
import {Plugins} from '@capacitor/core';

const {Storage} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    constructor() {
    }

    get(key: string): Promise<unknown> {
        return Storage.get({key})
            .then((data) => {
                if (data?.value) {
                    return JSON.parse(data.value);
                } else {
                    console.warn( 'StorageService: key \'' + key + '\' not found in storage');
                    return Promise.reject('#IGNORE' + key + ' not found in storage');
                }
            });
    }

    set(key: string, value: unknown): Promise<void> {
        return Storage.set({
            key,
            value: JSON.stringify(value)
        });
    }

    delete(key: string): Promise<void> {
        return Storage.remove({key});
    }

    nuke(): Promise<void> {
        return Storage.clear();
    }
}
