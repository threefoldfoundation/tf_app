import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'tff-investment-agreement-amount',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span *ngIf="amount">{{ 'tff.amount' | translate }}: {{ getAmount() }}</span>
  &ngsp;<span *ngIf="tokenCount">({{ 'tff.x_tokens' | translate: {count: tokenCount} }})</span>`,
})

export class InvestmentAgreementAmountComponent {
  @Input() tokenCount: number;
  @Input() amount: string;
  @Input() currency: string;

  constructor(private currencyPipe: CurrencyPipe) {
  }

  getAmount() {
    return this.currencyPipe.transform(this.amount, this.currency, 'code', this.currency === 'BTC' ? '1.8-8' : '1.2-2');
  }
}
