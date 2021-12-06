import {Pipe, PipeTransform} from '@angular/core';
import {Timestamp} from '@angular/fire/firestore';
import {format} from 'date-fns';

@Pipe({
    name: 'dateTime'
})
export class DateTimePipe implements PipeTransform {

    transform(value: Timestamp, ...args: unknown[]): unknown {
        return format(value.toDate(), 'dd-MM-yyyy HH:mm');
    }

}
