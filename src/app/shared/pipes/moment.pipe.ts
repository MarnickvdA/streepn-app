import {Pipe, PipeTransform} from '@angular/core';
import {Timestamp} from '@angular/fire/firestore';
import {differenceInHours, format, formatDistanceToNow} from 'date-fns';
import {nl} from 'date-fns/locale';

@Pipe({
    name: 'moment'
})
export class MomentPipe implements PipeTransform {

    constructor() {
    }

    transform(value: Timestamp, ...args: unknown[]): string {
        if (differenceInHours(Date.now(), value.toDate()) > 3) {
            return 'Op ' + format(value.toDate(), 'HH:mm dd-MM-yyyy');
        } else {
            return formatDistanceToNow(value.toDate(), {
                addSuffix: true,
                locale: nl
            });
        }
    }
}
