import {Pipe, PipeTransform} from '@angular/core';
import {Timestamp} from '@firebase/firestore-types';
import {differenceInHours, format, formatDistanceToNow} from 'date-fns';
import {nl} from 'date-fns/locale';
import {TranslateService} from '@ngx-translate/core';


@Pipe({
    name: 'moment'
})
export class MomentPipe implements PipeTransform {

    constructor(private translate: TranslateService) {
    }

    transform(value: Timestamp, ...args: unknown[]): string {
        if (differenceInHours(Date.now(), value.toDate()) > 3) {
            return this.translate.instant('date.at', {
                date: format(value.toDate(), 'HH:mm dd-MM-yyyy')
            });
        } else {
            return formatDistanceToNow(value.toDate(), {
                addSuffix: true,
                locale: nl
            });
        }
    }

}
