import {Injectable} from '@angular/core';
import {Plugins} from '@capacitor/core';
import {LoggerService} from './logger.service';
import {EventsService} from './events.service';

const {Storage} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private readonly logger = LoggerService.getLogger(StorageService.name);

    constructor() {
    }

    get(key: string): Promise<unknown> {
        return Storage.get({key})
            .then((data) => {
                if (data?.value) {
                    return JSON.parse(data.value);
                } else {
                    this.logger.warn({message: 'key ' + key + ' not found in storage'});
                    return Promise.reject(key + ' not found in storage');
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
