import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'asiLast' })
export class AsiLastPipe implements PipeTransform {

  constructor() {
  }

  transform(str: string, length: number) {
    if (str.length >= length) {
      return '...' + str.substring(str.length - length);
    } else {
      return str;
    }
  }
}
