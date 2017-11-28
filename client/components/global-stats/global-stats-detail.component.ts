import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { CurrencyValue, GlobalStats } from '../../interfaces/global-stats.interfaces';

import * as _ from 'lodash';

@Component({
  selector: 'tff-global-stats-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'global-stats-detail.component.html'
})
export class GlobalStatsDetailComponent {
  @Output() public onSave = new EventEmitter<GlobalStats>();


  get globalStats() {
    return this._globalStats;
  }

  @Input() public status: ApiRequestStatus;
  @Input() public updateStatus: ApiRequestStatus;

  @Input()
  set globalStats(value: GlobalStats) {
    this._globalStats = _.cloneDeep<GlobalStats>(value);
  }

  public newCurrency: string;

  private _globalStats: GlobalStats;

  public addCurrency() {
    if (this.globalStats.currencies.every(c => c.currency !== this.newCurrency)) {
      const newCurrency: CurrencyValue = {
        currency: this.newCurrency,
        value: 0,
        timestamp: Math.round(new Date().getTime() / 1000),
        auto_update: true,
      };
      this._globalStats = {...this._globalStats,  currencies: [ ...this._globalStats.currencies, newCurrency ]};
    }
    this.newCurrency = '';
  }

  public removeCurrency(currency: CurrencyValue) {
    this._globalStats.currencies = this._globalStats.currencies.filter(c => c.currency !== currency.currency);
  }

  public save(form: NgForm) {
    if (form.form.valid) {
      this.onSave.emit(this.globalStats);
    }
  }
}
