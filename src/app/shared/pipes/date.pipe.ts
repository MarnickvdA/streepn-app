import {Pipe, PipeTransform} from '@angular/core';
import {format} from 'date-fns';
import {Timestamp} from '@angular/fire/firestore';

@Pipe({
    name: 'date'
})
export class DatePipe implements PipeTransform {

    transform(value: Timestamp, ...args: unknown[]): unknown {
        return format(value.toDate(), 'dd-MM-yyyy');
    }

}
