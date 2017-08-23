import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

/**
 * Transforms an epoch timestamp to human readable format
 */
@Pipe({ name: 'timestamp', pure: true })
export class TimestampPipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {
  }

  public transform(value: number, pattern: string = 'medium'): any {
    return value ? (this.datePipe.transform(value * 1000, pattern)) : '';
  }

}
