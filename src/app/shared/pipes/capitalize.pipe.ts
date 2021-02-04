import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    const first = value.substr(0, 1).toUpperCase();
    return first + value.substr(1);
  }

}
