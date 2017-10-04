import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'investment-agreement-amount',
  preserveWhitespaces: false,
  encapsulation: ViewEncapsulation.None,
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
    return this.currencyPipe.transform(this.amount, this.currency, false, this.currency === 'BTC' ? '1.8-8' : '1.2-2');
  }
}
