import {Pipe, PipeTransform} from '@angular/core';
import {Timestamp} from '@firebase/firestore-types';
import {differenceInHours, format, formatDistanceToNow} from 'date-fns';
import {nl} from 'date-fns/locale';


@Pipe({
    name: 'moment'
})
export class MomentPipe implements PipeTransform {

    transform(value: Timestamp, ...args: unknown[]): string {
        if (differenceInHours(value.toDate(), Date.now()) > 3) {
            return 'Op ' + format(value.toDate(), 'HH:mm dd-MM-yyyy');
        } else {
            return formatDistanceToNow(value.toDate(), {
                addSuffix: true,
                locale: nl
            });
        }
    }

}
