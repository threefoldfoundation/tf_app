import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { INVESTMENT_AGREEMENT_STATUSES, InvestmentAgreementsQuery, InvestmentAgreementsStatuses } from '../../interfaces';

@Component({
  selector: 'tff-search-investment-agreements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'search-investment-agreements.component.html',
})
export class SearchInvestmentAgreementsComponent implements OnInit, OnDestroy {
  statuses: { label: string, value: InvestmentAgreementsStatuses }[] = Object.keys(INVESTMENT_AGREEMENT_STATUSES).map(status => ({
    label: INVESTMENT_AGREEMENT_STATUSES[ <InvestmentAgreementsStatuses>parseInt(status) ],
    value: parseInt(status),
  }));

  @Output() search = new EventEmitter<InvestmentAgreementsQuery>();
  private _debouncedQuery = new Subject<InvestmentAgreementsQuery>();
  private _querySub: Subscription;

  private _query: InvestmentAgreementsQuery;

  get query() {
    return this._query;
  }

  @Input() set query(value: InvestmentAgreementsQuery) {
    this._query = { ...value };
  }

  ngOnInit() {
    this._querySub = this._debouncedQuery.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(query => this.search.emit(query));
  }

  ngOnDestroy() {
    this._querySub.unsubscribe();
  }

  submit(debounced: boolean = true) {
    this.query = { ...this.query, cursor: null };
    if (debounced) {
      this._debouncedQuery.next(this.query);
    } else {
      this.search.emit(this.query);
    }
  }
}
