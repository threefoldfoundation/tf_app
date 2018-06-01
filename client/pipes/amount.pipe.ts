import { DecimalPipe } from '@angular/common';
import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Injectable()
@Pipe({ name: 'amount', pure: true })
export class AmountPipe implements PipeTransform {
  COIN_TO_HASTINGS_PRECISION = 9;
  COIN_TO_HASTINGS = Math.pow(10, this.COIN_TO_HASTINGS_PRECISION);

  constructor(private decimalPipe: DecimalPipe) {
  }

  transform(value: number | null, digits?: string) {
    if (value === null) {
      return null;
    }
    // old values used to be floats, support those as well
    const amount = value > 1000 ? value / this.COIN_TO_HASTINGS : value;
    return `${this.decimalPipe.transform(amount, digits)}`;
  }
}
