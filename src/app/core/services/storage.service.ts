import {Injectable} from '@angular/core';
import {EventsService} from './events.service';
import {Storage} from '@capacitor/storage';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    constructor(private events: EventsService) {
        this.events.subscribe('auth:logout', () => {
            this.nuke();
        });
    }

    get(key: string): Promise<unknown> {
        return Storage.get({key})
            .then((data) => {
                if (data?.value) {
                    return JSON.parse(data.value);
                } else {
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
