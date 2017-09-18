import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { GlobalStats } from '../../interfaces/global-stats.interfaces';
import { CurrencyValue } from '../../../../client/interfaces/global-stats.interfaces';

@Component({
  selector: 'global-stats',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'global-stats.component.html'
})

export class GlobalStatsComponent {
  @Input() globalStats: GlobalStats[];

  constructor(private currencyPipe: CurrencyPipe,
              private decimalPipe: DecimalPipe) {
  }

  getDollarValue(value: number) {
    return this.currencyPipe.transform(value, 'USD', true);
  }

  getValue(currency: CurrencyValue) {
    return this.decimalPipe.transform(currency.value, currency.currency === 'BTC' ? '1.8-8' : '1.2-2');
  }
}
