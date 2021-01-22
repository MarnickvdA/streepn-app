import { Pipe, PipeTransform } from '@angular/core';
import {getMoneyString} from '@core/utils/streepn-logic';

@Pipe({
  name: 'money'
})
export class MoneyPipe implements PipeTransform {
  transform(value: number): string {
    return getMoneyString(value);
  }
}
