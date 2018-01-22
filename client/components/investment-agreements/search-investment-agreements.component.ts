import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { INVESTMENT_AGREEMENT_STATUSES, InvestmentAgreementsQuery, InvestmentAgreementsStatuses } from '../../interfaces';

@Component({
  selector: 'tff-search-investment-agreements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'search-investment-agreements.component.html',
})
export class SearchInvestmentAgreementsComponent {
  statuses: { label: string, value: InvestmentAgreementsStatuses }[] = Object.keys(INVESTMENT_AGREEMENT_STATUSES).map(status => ({
    label: INVESTMENT_AGREEMENT_STATUSES[ <InvestmentAgreementsStatuses>parseInt(status) ],
    value: parseInt(status),
  }));

  @Output() search = new EventEmitter<InvestmentAgreementsQuery>();

  searchString: string | null;
  private _query: InvestmentAgreementsQuery;

  get query() {
    return { ...this._query, query: this.searchString };
  }

  @Input() set query(value: InvestmentAgreementsQuery) {
    this._query = { ...value, query: this.searchString || value.query };
    if (!this.searchString) {
      this.searchString = value.query;
    }
  }

  submit() {
    this.query = { ...this.query, cursor: null };
    this.search.emit(this.query);
  }
}
