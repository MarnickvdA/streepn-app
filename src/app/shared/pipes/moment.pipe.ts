import {Pipe, PipeTransform} from '@angular/core';
import {Timestamp} from '@firebase/firestore-types';
import {differenceInHours, format, formatDistanceToNow} from 'date-fns';
import {nl} from 'date-fns/locale';

@Pipe({
    name: 'moment'
})
export class MomentPipe implements PipeTransform {

    constructor() {
    }

    transform(value: Timestamp, ...args: unknown[]): string {
        if (args.length > 0 && args[0] === 'date') {
            return format(value.toDate(), 'dd-MM-yyyy');
        }

        if (differenceInHours(Date.now(), value.toDate()) > 3) {
            return 'Op ' + format(value.toDate(), 'HH:mm dd-MM-yyyy');
        }

        return formatDistanceToNow(value.toDate(), {
            addSuffix: true,
            locale: nl
        });
    }
}
