import { Pipe, PipeTransform } from '@angular/core';
import {getMoneyString} from '@core/utils/firestore-utils';

@Pipe({
  name: 'money'
})
export class MoneyPipe implements PipeTransform {
  transform(value: number): string {
    return getMoneyString(value);
  }
}
