import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyValue, GlobalStats } from '../../interfaces/global-stats.interfaces';
import { NgForm } from '@angular/forms';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';

import * as _ from 'lodash';

@Component({
  moduleId: module.id,
  selector: 'global-stats-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'global-stats-detail.component.html'
})
export class GlobalStatsDetailComponent {
  @Output() onSave = new EventEmitter<GlobalStats>();

  private _globalStats: GlobalStats;

  get globalStats() {
    return this._globalStats;
  }

  @Input() status: ApiRequestStatus;
  @Input() updateStatus: ApiRequestStatus;
  newCurrency: string;

  @Input()
  set globalStats(value: GlobalStats) {
    this._globalStats = _.cloneDeep<GlobalStats>(value);
  }

  addCurrency() {
    if (this.globalStats.currencies.every(c => c.currency !== this.newCurrency)) {
      const newCurrency: CurrencyValue = {
        currency: this.newCurrency,
        value: 0,
        timestamp: Math.round(new Date().getTime() / 1000),
        auto_update: true,
      };
      this._globalStats = Object.assign({}, this._globalStats, { currencies: [ ...this._globalStats.currencies, newCurrency ] });
    }
    this.newCurrency = '';
  }

  removeCurrency(currency: CurrencyValue) {
    this._globalStats.currencies = this._globalStats.currencies.filter(c => c.currency !== currency.currency);
  }

  save(form: NgForm) {
    if (form.form.valid) {
      this.onSave.emit(this.globalStats);
    }
  }
}
